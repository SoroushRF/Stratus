-- Phase 3: AI Logic Control Migration

-- 1. Global AI Configuration Table
CREATE TABLE IF NOT EXISTS ai_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT now()
);

-- 2. Named Prompts Table
CREATE TABLE IF NOT EXISTS ai_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    slug TEXT UNIQUE NOT NULL,
    prompt_text TEXT NOT NULL,
    model_override TEXT,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT now()
);

-- 3. Execution Logs for Observability
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
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT now()
);

-- 4. Initial Seed Data
INSERT INTO
    ai_configs (key, value, description)
VALUES (
        'default_model',
        '"gemini-2.5-flash"',
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
    ) ON CONFLICT (key) DO NOTHING;

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
        'gemini-2.5-flash'
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
        'gemini-2.5-flash'
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
        'gemini-2.5-flash'
    ) ON CONFLICT (slug) DO NOTHING;