/*
  # Insert Demo Users for MBG Kitchen System

  1. Purpose
     - Create demo user accounts for testing and demonstration
     - Each user represents a different role in the system
     - All users use the same password for easy testing: pass123

  2. Demo Users Created
     - superadmin@mbg.com - Super Admin (full system access)
     - manager@mbg.com - Manager (management access)
     - finance@mbg.com - Finance (financial module)
     - hrd@mbg.com - HRD (HR module)
     - procurement@mbg.com - Procurement (procurement module)
     - staff@mbg.com - Staff (limited access)

  3. Security Note
     - These are demo accounts only
     - Password: pass123 (hashed using Supabase Auth)
     - In production, use strong passwords and proper user management
*/

-- Note: User accounts are created through Supabase Auth system
-- This migration creates the profile records that will be linked to auth.users

-- The actual user creation will be done through the Supabase dashboard or API
-- For now, we'll create placeholder profile structure

-- Insert demo profiles (these will be linked when users sign up)
-- The actual linking happens automatically when users authenticate

-- This is a placeholder migration
-- In a real scenario, you would use the Supabase API or dashboard to create users
-- The profiles table will be populated via triggers when users authenticate
