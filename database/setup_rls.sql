-- Setup Row Level Security (RLS) for Supabase
-- Execute this script in your Supabase SQL Editor

-- Enable RLS on Leads table
ALTER TABLE Leads ENABLE ROW LEVEL SECURITY;

-- Enable RLS on investimento table
ALTER TABLE investimento ENABLE ROW LEVEL SECURITY;

-- Create policy for Leads table
-- This policy allows read access to authenticated users only
-- Adjust the policy logic based on your authentication requirements

-- Policy: Allow authenticated users to read all leads
CREATE POLICY "Allow authenticated users to read leads"
ON Leads FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow service role to manage leads (for admin operations)
CREATE POLICY "Allow service role to manage leads"
ON Leads FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create policy for investimento table
-- Policy: Allow authenticated users to read investment data
CREATE POLICY "Allow authenticated users to read investment"
ON investimento FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow service role to manage investment data
CREATE POLICY "Allow service role to manage investment"
ON investimento FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Optional: Add more restrictive policies based on user roles or departments
-- Example: Restrict access by empreendimento (uncomment and customize)

-- CREATE POLICY "Users can only read leads from their empreendimento"
-- ON Leads FOR SELECT
-- TO authenticated
-- USING (
--   empreendimento IN (
--     SELECT empreendimento 
--     FROM user_empreendimentos 
--     WHERE user_id = auth.uid()
--   )
-- );

-- Create a function to check if user is admin (optional)
-- CREATE OR REPLACE FUNCTION is_admin()
-- RETURNS boolean
-- LANGUAGE sql
-- SECURITY DEFINER
-- AS $$
--   SELECT EXISTS (
--     SELECT 1 
--     FROM user_roles 
--     WHERE user_id = auth.uid() 
--     AND role = 'admin'
--   );
-- $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Note: This is a basic RLS setup. For production:
-- 1. Implement proper user authentication with Supabase Auth
-- 2. Create user_roles table to manage permissions
-- 3. Add more granular policies based on business requirements
-- 4. Consider implementing column-level security for sensitive fields
-- 5. Add audit logging to track data access
