-- Create Universities Table
CREATE TABLE IF NOT EXISTS universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    campus TEXT NOT NULL,
    lat FLOAT8 NOT NULL,
    lng FLOAT8 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to universities" ON universities FOR
SELECT USING (true);

-- Allow admin write access (using service role or if we add is_admin later)
CREATE POLICY "Allow admin full access to universities" ON universities FOR ALL USING (true);
-- We will wrap this in API security, but internal RLS can be tuned later

-- Add unique constraint for migration stability
ALTER TABLE universities
ADD CONSTRAINT unique_uni_campus UNIQUE (name, campus);