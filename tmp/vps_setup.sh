#!/bin/bash
set -e

echo "============================================"
echo "  MBG VPS Environment Setup"
echo "  Target: Ubuntu 22.04 - mbgone@103.126.117.20"
echo "============================================"

# ---- Step 1: System Update ----
echo ""
echo ">>> [1/6] Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# ---- Step 2: Install Node.js 20 LTS via NodeSource ----
echo ""
echo ">>> [2/6] Installing Node.js 20 LTS..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  echo "Node.js $(node --version) installed."
  echo "npm $(npm --version) installed."
else
  echo "Node.js already installed: $(node --version)"
fi

# ---- Step 3: Install Docker ----
echo ""
echo ">>> [3/6] Installing Docker..."
if ! command -v docker &> /dev/null; then
  sudo apt-get install -y ca-certificates curl gnupg
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update -y
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  sudo usermod -aG docker mbgone
  echo "Docker $(docker --version) installed."
else
  echo "Docker already installed: $(docker --version)"
fi

# ---- Step 4: Install GitHub CLI (gh) ----
echo ""
echo ">>> [4/6] Installing GitHub CLI..."
if ! command -v gh &> /dev/null; then
  (type -p wget >/dev/null || sudo apt-get install wget -y) \
  && sudo mkdir -p -m 755 /etc/apt/keyrings \
  && wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
  && sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli-stable.list > /dev/null \
  && sudo apt-get update -y \
  && sudo apt-get install gh -y
  echo "gh $(gh --version | head -1) installed."
else
  echo "gh already installed: $(gh --version | head -1)"
fi

# ---- Step 5: Install @google/gemini-cli ----
echo ""
echo ">>> [5/6] Installing @google/gemini-cli..."
if ! command -v gemini &> /dev/null; then
  sudo npm install -g @google/gemini-cli
  echo "gemini-cli installed."
else
  echo "gemini-cli already installed."
fi

# ---- Step 6: Create project directory ----
echo ""
echo ">>> [6/6] Preparing project directory..."
mkdir -p /home/mbgone/mbg-management/backend

echo ""
echo "============================================"
echo "  ✅ VPS Setup Complete!"
echo "============================================"
echo "Node.js: $(node --version 2>/dev/null || echo 'N/A')"
echo "npm:     $(npm --version 2>/dev/null || echo 'N/A')"
echo "Docker:  $(docker --version 2>/dev/null || echo 'N/A')"
echo "gh:      $(gh --version 2>/dev/null | head -1 || echo 'N/A')"
echo "gemini:  $(gemini --version 2>/dev/null || echo 'N/A')"
echo "git:     $(git --version 2>/dev/null || echo 'N/A')"
echo "============================================"
