#!/bin/bash
# 🛡️ MBG System Hardening & Ransomware Protection
# This script applies security best practices to the VPS.

set -e

echo "Starting System Hardening..."

# 1. Update System
echo ">>> Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Firewall Configuration (UFW)
echo ">>> Configuring Firewall (UFW)..."
sudo apt-get install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
# Keep MySQL (3306) blocked from outside!
sudo ufw --force enable

# 3. Fail2Ban Installation (Brute Force Protection)
echo ">>> Installing Fail2Ban..."
sudo apt-get install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# 4. Secure Docker - Ensure MySQL is not exposed to 0.0.0.0 if not needed
# In docker-compose.yml, we should change "3306:3306" to "127.0.0.1:3306:3306"
echo ">>> Advice: Update docker-compose.yml to bind MySQL to 127.0.0.1 only."

# 5. Disable Password Authentication for SSH (Key only)
echo ">>> Hardening SSH..."
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# 6. Automatic Backups Script Creation
echo ">>> Creating automated backup script..."
cat << 'EOF' > /home/mbgone/backup_db.sh
#!/bin/bash
BACKUP_DIR="/home/mbgone/backups"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
docker exec mbg_mysql mysqldump -u root -pf2RZScqZe5JOmvd3xeBvQlkpo4Vutjm9 mbg_management > $BACKUP_DIR/mbg_backup_$TIMESTAMP.sql
# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
echo "Backup completed: mbg_backup_$TIMESTAMP.sql"
EOF

chmod +x /home/mbgone/backup_db.sh
# Add to crontab for daily backup at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /home/mbgone/backup_db.sh") | crontab -

echo "✅ Hardening Complete! System is now more secure."
