-- Add first_name and last_name columns to users table
-- Run this in Supabase SQL Editor

ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Update existing users to split their name if it exists
UPDATE users
SET
    first_name = SPLIT_PART (name, ' ', 1),
    last_name = CASE
        WHEN ARRAY_LENGTH (
            STRING_TO_ARRAY (name, ' '),
            1
        ) > 1 THEN SUBSTRING(
            name
            FROM POSITION(' ' IN name) + 1
        )
        ELSE ''
    END
WHERE
    name IS NOT NULL
    AND first_name IS NULL;