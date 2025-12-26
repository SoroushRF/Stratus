-- =============================================
-- PHASE 4 MIGRATION: OPERATIONS & HEALTH
-- =============================================

-- 1. AI Log Telemetry Enhancement
-- Adding token tracking and user context to logs
ALTER TABLE ai_logs
ADD COLUMN IF NOT EXISTS prompt_tokens INTEGER,
ADD COLUMN IF NOT EXISTS completion_tokens INTEGER,
ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users (id);

-- 2. System Broadcasts Table
-- Used for pushing global notices to user dashboards
CREATE TABLE IF NOT EXISTS system_notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'info', 'warning', 'critical', 'maintenance'
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP
    WITH
        TIME ZONE,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT now()
);

-- Index for performance on active notices
CREATE INDEX IF NOT EXISTS idx_system_notices_active ON system_notices (is_active)
WHERE
    is_active = true;

-- 3. Operational Configs
-- Maintenance mode and API usage tracking
INSERT INTO
    ai_configs (key, value, description)
VALUES (
        'maintenance_mode',
        'false',
        'Global kill-switch for AI and Weather analysis engines'
    ),
    (
        'tomorrow_api_usage_daily',
        '0',
        'Count of Tomorrow.io requests made in the current 24-hour window'
    ),
    (
        'tomorrow_api_limit',
        '500',
        'Daily limit for Tomorrow.io API requests (Free tier is 500)'
    ) ON CONFLICT (key) DO NOTHING;

-- 4. Audit Trigger for System Notices
CREATE OR REPLACE FUNCTION update_system_notices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER tr_system_notices_updated_at
    BEFORE UPDATE ON system_notices
    FOR EACH ROW
    EXECUTE FUNCTION update_system_notices_updated_at();

-- 5. RPC function for safe usage incrementing
CREATE OR REPLACE FUNCTION increment_weather_usage()
RETURNS void AS $$
BEGIN
    UPDATE ai_configs 
    SET value = (value::int + 1)::text::jsonb
    WHERE key = 'tomorrow_api_usage_daily';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;