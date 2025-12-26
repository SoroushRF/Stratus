-- Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
-- Generally public read, admin write
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 1. USERS TABLE
-- =============================================================================

-- Policy: Users can see their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid()::text = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid()::text = id);

-- Policy: Admins can view all users
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users AS u
    WHERE u.id = auth.uid()::text AND u.is_admin = true
  )
);

-- =============================================================================
-- 2. SCHEDULES TABLE
-- =============================================================================

-- Policy: Users can view their own schedules
CREATE POLICY "Users can view own schedules"
ON schedules FOR SELECT
USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own schedules
CREATE POLICY "Users can insert own schedules"
ON schedules FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own schedules
CREATE POLICY "Users can update own schedules"
ON schedules FOR UPDATE
USING (auth.uid()::text = user_id);

-- Policy: Users can delete their own schedules
CREATE POLICY "Users can delete own schedules"
ON schedules FOR DELETE
USING (auth.uid()::text = user_id);

-- =============================================================================
-- 3. UNIVERSITIES TABLE
-- =============================================================================

-- Policy: Public read access
CREATE POLICY "Public read access for universities" ON universities FOR
SELECT USING (true);

-- Policy: Admin write access
CREATE POLICY "Admins can insert/update universities"
ON universities FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users AS u
    WHERE u.id = auth.uid()::text AND u.is_admin = true
  )
);

-- =============================================================================
-- 4. NOTICES TABLE
-- =============================================================================

-- Policy: Public read active notices
CREATE POLICY "Public can read active notices" ON notices FOR
SELECT USING (is_active = true);

-- Policy: Admin full access
CREATE POLICY "Admins have full access to notices"
ON notices FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users AS u
    WHERE u.id = auth.uid()::text AND u.is_admin = true
  )
);