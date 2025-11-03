/*
  # MBG Kitchen Management System Database Schema

  ## Overview
  Complete database schema for MBG Kitchen Management System including:
  - Authentication and user roles
  - Kitchen locations and distribution
  - Construction contracts and progress
  - Equipment procurement and inventory
  - HR and employee management
  - Financial tracking and funding

  ## Tables Created

  1. **profiles**
     - Extended user profile data
     - Links to auth.users
     - Role-based access control (Super Admin, Manager, Finance, HRD, Procurement, Staff)
     - Department and position information

  2. **kitchens**
     - Kitchen location data
     - Coordinates for map display
     - Capacity and status tracking
     - Region/area grouping

  3. **distribution_routes**
     - Delivery routes for food distribution
     - Vehicle tracking data
     - ETA calculations

  4. **construction_contracts**
     - Contract management for kitchen construction
     - Vendor information
     - Progress tracking
     - Payment termin schedule

  5. **contract_progress**
     - Progress updates with percentage
     - Photo documentation
     - Status tracking (ongoing, completed, delayed)

  6. **equipment**
     - Equipment catalog
     - Stock management
     - QR code references
     - Category and supplier tracking

  7. **purchase_orders**
     - PO management
     - Workflow status (draft, waiting approval, approved, delivered)
     - Total amount tracking

  8. **po_items**
     - Line items for purchase orders
     - Quantity and price tracking

  9. **employees**
     - Employee database
     - Department and position
     - Photo and contact information

  10. **job_vacancies**
      - Recruitment portal
      - Application tracking

  11. **applicants**
      - Job applicant records
      - Interview scheduling

  12. **attendance**
      - Daily attendance tracking
      - Leave management

  13. **payroll**
      - Monthly payroll records
      - Salary calculations

  14. **financial_transactions**
      - Income and expense tracking
      - Categorization
      - Approval workflow

  15. **loans**
      - Loan and funding tracking
      - Repayment schedules
      - Partner information

  16. **activities**
      - System activity log
      - User actions tracking

  ## Security
  - RLS enabled on all tables
  - Policies based on user roles
  - Authenticated access required
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('Super Admin', 'Manager', 'Finance', 'HRD', 'Procurement', 'Staff')),
  department text,
  position text,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create kitchens table
CREATE TABLE IF NOT EXISTS kitchens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  capacity integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'construction', 'inactive')),
  region text NOT NULL,
  manager_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE kitchens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view kitchens"
  ON kitchens FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super Admin and Manager can manage kitchens"
  ON kitchens FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Super Admin', 'Manager')
    )
  );

-- Create distribution_routes table
CREATE TABLE IF NOT EXISTS distribution_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kitchen_id uuid REFERENCES kitchens(id) ON DELETE CASCADE,
  route_name text NOT NULL,
  vehicle_number text,
  driver_name text,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_transit', 'completed')),
  eta timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE distribution_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view routes"
  ON distribution_routes FOR SELECT
  TO authenticated
  USING (true);

-- Create construction_contracts table
CREATE TABLE IF NOT EXISTS construction_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number text UNIQUE NOT NULL,
  kitchen_id uuid REFERENCES kitchens(id),
  vendor_name text NOT NULL,
  contract_value decimal(15, 2) NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'delayed')),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE construction_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view contracts"
  ON construction_contracts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Manager and Super Admin can manage contracts"
  ON construction_contracts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Super Admin', 'Manager')
    )
  );

-- Create contract_progress table
CREATE TABLE IF NOT EXISTS contract_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES construction_contracts(id) ON DELETE CASCADE,
  update_date date NOT NULL,
  progress_percentage integer NOT NULL,
  notes text,
  photo_url text,
  termin_number integer,
  termin_amount decimal(15, 2),
  payment_status text CHECK (payment_status IN ('pending', 'approved', 'paid')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contract_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view progress"
  ON contract_progress FOR SELECT
  TO authenticated
  USING (true);

-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text,
  price decimal(15, 2) NOT NULL,
  supplier_name text,
  stock_quantity integer DEFAULT 0,
  qr_code text,
  image_url text,
  status text DEFAULT 'available' CHECK (status IN ('available', 'low_stock', 'out_of_stock')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view equipment"
  ON equipment FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Procurement can manage equipment"
  ON equipment FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Super Admin', 'Procurement')
    )
  );

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number text UNIQUE NOT NULL,
  supplier_name text NOT NULL,
  total_amount decimal(15, 2) NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'waiting_approval', 'approved', 'delivered')),
  requested_by uuid REFERENCES profiles(id),
  approved_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view POs"
  ON purchase_orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Procurement can create POs"
  ON purchase_orders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Super Admin', 'Procurement')
    )
  );

-- Create po_items table
CREATE TABLE IF NOT EXISTS po_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id uuid REFERENCES purchase_orders(id) ON DELETE CASCADE,
  equipment_id uuid REFERENCES equipment(id),
  quantity integer NOT NULL,
  unit_price decimal(15, 2) NOT NULL,
  subtotal decimal(15, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE po_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view PO items"
  ON po_items FOR SELECT
  TO authenticated
  USING (true);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_number text UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text UNIQUE,
  phone text,
  department text NOT NULL,
  position text NOT NULL,
  hire_date date NOT NULL,
  salary decimal(15, 2),
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view employees"
  ON employees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "HRD can manage employees"
  ON employees FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Super Admin', 'HRD')
    )
  );

-- Create job_vacancies table
CREATE TABLE IF NOT EXISTS job_vacancies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  department text NOT NULL,
  description text,
  requirements text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  posted_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE job_vacancies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view vacancies"
  ON job_vacancies FOR SELECT
  TO authenticated
  USING (true);

-- Create applicants table
CREATE TABLE IF NOT EXISTS applicants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vacancy_id uuid REFERENCES job_vacancies(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  resume_url text,
  status text DEFAULT 'applied' CHECK (status IN ('applied', 'interview', 'accepted', 'rejected')),
  interview_date timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view applicants"
  ON applicants FOR SELECT
  TO authenticated
  USING (true);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  date date NOT NULL,
  check_in timestamptz,
  check_out timestamptz,
  status text DEFAULT 'present' CHECK (status IN ('present', 'absent', 'leave', 'sick')),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, date)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (true);

-- Create payroll table
CREATE TABLE IF NOT EXISTS payroll (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  month integer NOT NULL,
  year integer NOT NULL,
  base_salary decimal(15, 2) NOT NULL,
  allowances decimal(15, 2) DEFAULT 0,
  deductions decimal(15, 2) DEFAULT 0,
  net_salary decimal(15, 2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, month, year)
);

ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view payroll"
  ON payroll FOR SELECT
  TO authenticated
  USING (true);

-- Create financial_transactions table
CREATE TABLE IF NOT EXISTS financial_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date date NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text NOT NULL,
  amount decimal(15, 2) NOT NULL,
  description text,
  reference_number text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by uuid REFERENCES profiles(id),
  approved_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view transactions"
  ON financial_transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Finance can manage transactions"
  ON financial_transactions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Super Admin', 'Finance')
    )
  );

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_number text UNIQUE NOT NULL,
  lender_name text NOT NULL,
  loan_amount decimal(15, 2) NOT NULL,
  interest_rate decimal(5, 2) NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  monthly_payment decimal(15, 2) NOT NULL,
  remaining_balance decimal(15, 2) NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paid_off', 'defaulted')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view loans"
  ON loans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Finance can manage loans"
  ON loans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Super Admin', 'Finance')
    )
  );

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  module text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all activities"
  ON activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
