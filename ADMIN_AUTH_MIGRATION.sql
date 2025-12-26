-- Add is_admin column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- OPTIONAL: Set a specific user as admin (You can run this manually in Supabase with your ID)
-- UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';