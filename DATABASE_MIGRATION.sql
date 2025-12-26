-- =============================================
-- STRATUS DATABASE SCHEMA - COMPLETE MIGRATION
-- =============================================
-- This file contains ALL database migrations for Stratus
-- Run this in your Supabase SQL Editor to set up the complete schema

-- =============================================
-- PHASE 1: CORE TABLES
-- =============================================

-- 1. Users Table (extended from Auth0)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id TEXT UNIQUE NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    university TEXT,
    campus TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Schedules
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    parsed_classes JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Universities
CREATE TABLE IF NOT EXISTS universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    campus TEXT NOT NULL,
    lat FLOAT8 NOT NULL,
    lng FLOAT8 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_uni_campus UNIQUE (name, campus)
);

-- =============================================
-- PHASE 2: AI INFRASTRUCTURE
-- =============================================

-- 1. AI Configuration Table
CREATE TABLE IF NOT EXISTS ai_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. AI Prompts Table
CREATE TABLE IF NOT EXISTS ai_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    slug TEXT UNIQUE NOT NULL,
    prompt_text TEXT NOT NULL,
    model_override TEXT,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. AI Execution Logs
CREATE TABLE IF NOT EXISTS ai_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    slug TEXT NOT NULL,
    input_type TEXT,
    raw_input TEXT,
    raw_output TEXT,
    status TEXT,
    error_message TEXT,
    latency_ms INTEGER,
    model_used TEXT,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    user_id TEXT REFERENCES users (id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PHASE 3: OPERATIONS & MONITORING
-- =============================================

-- 1. System Notices
CREATE TABLE IF NOT EXISTS system_notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'info', 'warning', 'critical', 'maintenance'
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules (user_id);

CREATE INDEX IF NOT EXISTS idx_schedules_active ON schedules (is_active)
WHERE
    is_active = true;

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles (user_id);

CREATE INDEX IF NOT EXISTS idx_system_notices_active ON system_notices (is_active)
WHERE
    is_active = true;

CREATE INDEX IF NOT EXISTS idx_ai_logs_slug ON ai_logs (slug);

CREATE INDEX IF NOT EXISTS idx_ai_logs_user_id ON ai_logs (user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

ALTER TABLE ai_configs ENABLE ROW LEVEL SECURITY;

ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;

ALTER TABLE system_notices ENABLE ROW LEVEL SECURITY;

-- Universities: Public read access
CREATE POLICY "universities_public_read" ON universities FOR
SELECT USING (true);

CREATE POLICY "universities_admin_write" ON universities FOR ALL USING (true);
-- API handles admin checks

-- AI Tables: Service role only (API handles auth)
CREATE POLICY "ai_configs_service_only" ON ai_configs FOR ALL USING (false)
WITH
    CHECK (false);

CREATE POLICY "ai_logs_service_only" ON ai_logs FOR ALL USING (false)
WITH
    CHECK (false);

CREATE POLICY "ai_prompts_service_only" ON ai_prompts FOR ALL USING (false)
WITH
    CHECK (false);

-- System Notices: Public read active, service write
CREATE POLICY "system_notices_public_read" ON system_notices FOR
SELECT USING (is_active = true);

CREATE POLICY "system_notices_no_public_write" ON system_notices FOR
INSERT
WITH
    CHECK (false);

CREATE POLICY "system_notices_no_public_update" ON system_notices FOR
UPDATE USING (false);

CREATE POLICY "system_notices_no_public_delete" ON system_notices FOR DELETE USING (false);

-- Grant service role permissions
GRANT ALL ON ai_configs TO service_role;

GRANT ALL ON ai_logs TO service_role;

GRANT ALL ON ai_prompts TO service_role;

GRANT ALL ON system_notices TO service_role;

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_system_notices_updated_at
    BEFORE UPDATE ON system_notices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =============================================
-- SEED DATA
-- =============================================

-- AI Configuration Defaults
INSERT INTO
    ai_configs (key, value, description)
VALUES (
        'default_model',
        '"gemini-2.0-flash-exp"',
        'The default Gemini model for all AI operations'
    ),
    (
        'default_temperature',
        '0.7',
        'Creativity level of the AI (0.0 to 1.0)'
    ),
    (
        'max_output_tokens',
        '2048',
        'Maximum length of AI response'
    ),
    (
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

-- AI Prompts (schedule parser, attire advisor, master recommendation)
INSERT INTO
    ai_prompts (
        slug,
        prompt_text,
        model_override
    )
VALUES (
        'schedule-parser',
        'Analyze the provided image, PDF, or text file of a schedule and extract the classes.
    
Return a JSON array of objects with this schema:
[{
  "name": "Class Name",
  "startTime": "HH:mm",
  "endTime": "HH:mm",
  "days": ["MONDAY", "TUESDAY"],
  "location": "Optional Location"
}]

Strict Rules:
1. Convert all times to 24-hour HH:mm format.
2. Normalize days to: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY.
3. If no specific days are found, omit the "days" field.
4. If the schedule is just a list of events with times, extract them regardless of weekly repetition.
5. Return ONLY the JSON array.',
        'gemini-2.0-flash-exp'
    ),
    (
        'attire-advisor',
        'You are a practical campus fashion advisor for Canadian university students.

CLASS CONTEXT:
- Class: {{className}}
- Time: {{timeSpan}} ({{duration}}h duration)
- Time of Day: {{timeOfDay}}
- Location: {{location}}

WEATHER CONDITIONS:
{{weatherContext}}

TASK:
Generate a practical clothing recommendation considering:
1. **Campus Practicality**: Walking between buildings, sitting in lectures, indoor heating
2. **Canadian Winter Realities**: Wind chill, sudden weather changes, overheated classrooms
3. **Comfort vs. Style**: Balance looking good with staying comfortable for {{duration}} hours
4. **Class Duration**: Longer classes need more comfort considerations

Return ONLY valid JSON matching this exact schema:
{
  "recommendation": "Brief outfit description (1-2 sentences)",
  "reasoning": "Why this outfit works for these conditions (1 sentence)",
  "accessories": ["Item 1", "Item 2"],
  "priority": "essential" or "suggested"
}

Rules:
- "essential" priority = weather requires specific protection (rain, extreme cold, etc.)
- "suggested" priority = general comfort recommendations
- Keep recommendations practical and campus-appropriate
- Focus on layering for indoor/outdoor transitions
- Accessories should be genuinely useful, not decorative',
        'gemini-2.0-flash-exp'
    ),
    (
        'master-recommendation',
        'You are a practical campus fashion advisor creating a MASTER outfit recommendation for an entire day.

DAILY CONTEXT:
- Number of classes: {{classCount}}
- Time span: {{earliest}} to {{latest}}
- Temperature range: {{minTemp}}°C to {{maxTemp}}°C (feels like {{minFeelsLike}}°C at coldest)
- Weather conditions: {{conditions}}
- Max wind speed: {{maxWind}} km/h

INDIVIDUAL CLASS RECOMMENDATIONS:
{{classRecommendations}}

TASK:
Create ONE master outfit that works for ALL classes. Focus on:
1. **Layering Strategy**: How to adjust for temperature changes ({{minTemp}}°C → {{maxTemp}}°C)
2. **Worst-Case Protection**: Handle the coldest/windiest/wettest conditions
3. **Indoor Comfort**: Account for overheated classrooms
4. **Campus Practicality**: Easy to adjust between classes

Return ONLY valid JSON matching this exact schema:
{
  "baseOutfit": "Core outfit description (jacket, pants, shoes)",
  "layeringStrategy": "How to adjust throughout the day (what to add/remove when)",
  "essentialAccessories": ["Item 1", "Item 2"],
  "reasoning": "Why this outfit works for the entire day (1-2 sentences)"
}

Rules:
- Base outfit should handle the worst conditions
- Layering strategy should explain when to add/remove layers
- Essential accessories are items you MUST bring
- Keep it practical and campus-appropriate',
        'gemini-2.0-flash-exp'
    ) ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Run these to verify the migration:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- SELECT * FROM pg_policies WHERE schemaname = 'public';