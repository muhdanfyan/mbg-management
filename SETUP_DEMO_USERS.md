# Setup Demo Users for MBG Kitchen Management System

This guide will help you create demo user accounts in Supabase for testing the system.

## Demo Users Overview

The system supports 6 different roles with specific access levels:

1. **Super Admin** - Full system access to all modules
2. **Manager** - Access to locations and construction modules
3. **Finance** - Access to financial management module
4. **HRD** - Access to HR management module
5. **Procurement** - Access to procurement and equipment modules
6. **Staff** - Limited access to dashboard only

## Creating Demo Users in Supabase

### Method 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Users**
3. Click **Add User** and create each user with the following details:

#### User 1: Super Admin
- Email: `superadmin@mbg.com`
- Password: `pass123`
- After creation, go to **Database** > **profiles** table
- Insert a new row with:
  - `id`: (copy the UUID from auth.users)
  - `email`: `superadmin@mbg.com`
  - `full_name`: `Super Admin`
  - `role`: `Super Admin`
  - `department`: `Management`
  - `position`: `System Administrator`

#### User 2: Manager
- Email: `manager@mbg.com`
- Password: `pass123`
- Profile:
  - `full_name`: `Manager User`
  - `role`: `Manager`
  - `department`: `Management`
  - `position`: `Operations Manager`

#### User 3: Finance
- Email: `finance@mbg.com`
- Password: `pass123`
- Profile:
  - `full_name`: `Finance User`
  - `role`: `Finance`
  - `department`: `Finance`
  - `position`: `Finance Manager`

#### User 4: HRD
- Email: `hrd@mbg.com`
- Password: `pass123`
- Profile:
  - `full_name`: `HRD User`
  - `role`: `HRD`
  - `department`: `Human Resources`
  - `position`: `HR Manager`

#### User 5: Procurement
- Email: `procurement@mbg.com`
- Password: `pass123`
- Profile:
  - `full_name`: `Procurement User`
  - `role`: `Procurement`
  - `department`: `Procurement`
  - `position`: `Procurement Manager`

#### User 6: Staff
- Email: `staff@mbg.com`
- Password: `pass123`
- Profile:
  - `full_name`: `Staff User`
  - `role`: `Staff`
  - `department`: `Operations`
  - `position`: `Staff Member`

### Method 2: Using SQL (Quick Setup)

Run the following SQL in your Supabase SQL Editor after creating users in Authentication:

```sql
-- Note: First create the users through Supabase Auth Dashboard,
-- then run this SQL to create their profiles

-- Replace the UUIDs below with the actual user IDs from auth.users table

INSERT INTO profiles (id, email, full_name, role, department, position)
VALUES
  ('USER_ID_1', 'superadmin@mbg.com', 'Super Admin', 'Super Admin', 'Management', 'System Administrator'),
  ('USER_ID_2', 'manager@mbg.com', 'Manager User', 'Manager', 'Management', 'Operations Manager'),
  ('USER_ID_3', 'finance@mbg.com', 'Finance User', 'Finance', 'Finance', 'Finance Manager'),
  ('USER_ID_4', 'hrd@mbg.com', 'HRD User', 'HRD', 'Human Resources', 'HR Manager'),
  ('USER_ID_5', 'procurement@mbg.com', 'Procurement User', 'Procurement', 'Procurement', 'Procurement Manager'),
  ('USER_ID_6', 'staff@mbg.com', 'Staff User', 'Staff', 'Operations', 'Staff Member');
```

## Testing the System

After creating the demo users:

1. Open the application
2. On the login page, you'll see all demo accounts listed
3. Click any demo account card to auto-fill the login form
4. Click "Sign In" to access the system
5. Each role will have access to different modules based on their permissions

## Role-Based Access Control

- **Super Admin**: Dashboard, Peta Lokasi, Pengawasan, Procurement, Manajemen SDM, Keuangan
- **Manager**: Dashboard, Peta Lokasi, Pengawasan
- **Finance**: Dashboard, Keuangan
- **HRD**: Dashboard, Manajemen SDM
- **Procurement**: Dashboard, Procurement
- **Staff**: Dashboard only

## Security Notes

- All demo users use the password `pass123` for easy testing
- In production, use strong passwords and enable email confirmation
- Consider implementing password policies and 2FA
- Review and adjust RLS policies based on your security requirements
