import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Fetch all operations data (config + notices)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Fetch config data
    if (type === 'config') {
      const { data, error } = await supabaseAdmin
        .from('ai_configs')
        .select('key, value')
        .in('key', ['maintenance_mode', 'tomorrow_api_usage_daily', 'tomorrow_api_limit']);

      if (error) {
        console.error('Error fetching config:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      const config: Record<string, any> = {};
      data?.forEach((item) => {
        config[item.key] = item.value;
      });

      return NextResponse.json({ success: true, config });
    }

    // Fetch notices
    if (type === 'notices') {
      const { data, error } = await supabaseAdmin
        .from('system_notices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notices:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, notices: data });
    }

    // Fetch token analytics
    if (type === 'analytics') {
      const { data, error } = await supabaseAdmin
        .from('ai_logs')
        .select('prompt_tokens, completion_tokens, model_used, created_at')
        .not('prompt_tokens', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      // Calculate totals
      const totalPromptTokens = data?.reduce((sum, log) => sum + (log.prompt_tokens || 0), 0) || 0;
      const totalCompletionTokens = data?.reduce((sum, log) => sum + (log.completion_tokens || 0), 0) || 0;
      const totalTokens = totalPromptTokens + totalCompletionTokens;

      // Gemini pricing (approximate, per 1M tokens)
      // Flash models: $0.075 input, $0.30 output
      const estimatedCost = (totalPromptTokens / 1000000 * 0.075) + (totalCompletionTokens / 1000000 * 0.30);

      // Group by model
      const byModel: Record<string, { prompt: number; completion: number; count: number }> = {};
      data?.forEach(log => {
        const model = log.model_used || 'unknown';
        if (!byModel[model]) {
          byModel[model] = { prompt: 0, completion: 0, count: 0 };
        }
        byModel[model].prompt += log.prompt_tokens || 0;
        byModel[model].completion += log.completion_tokens || 0;
        byModel[model].count += 1;
      });

      return NextResponse.json({ 
        success: true, 
        analytics: {
          totalPromptTokens,
          totalCompletionTokens,
          totalTokens,
          estimatedCost,
          byModel,
          recentLogs: data?.slice(0, 10) || []
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create notice or update maintenance mode
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // Toggle maintenance mode
    if (action === 'maintenance') {
      const { enabled } = body;

      const { error } = await supabaseAdmin
        .from('ai_configs')
        .update({ value: enabled ? 'true' : 'false' })
        .eq('key', 'maintenance_mode');

      if (error) {
        console.error('Error updating maintenance mode:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // Create notice
    if (action === 'create_notice') {
      const { title, message, type, expires_at } = body;

      const noticeData: any = {
        title,
        message,
        type,
        is_active: true
      };

      if (expires_at) {
        noticeData.expires_at = new Date(expires_at).toISOString();
      }

      const { error } = await supabaseAdmin
        .from('system_notices')
        .insert(noticeData);

      if (error) {
        console.error('Error creating notice:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // Toggle notice
    if (action === 'toggle_notice') {
      const { id, is_active } = body;

      const { error } = await supabaseAdmin
        .from('system_notices')
        .update({ is_active })
        .eq('id', id);

      if (error) {
        console.error('Error updating notice:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
