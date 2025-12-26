import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper to check admin status
async function checkAdmin(request: NextRequest) {
  const sessionCookie = request.cookies.get('auth0_session');
  if (!sessionCookie) return false;

  try {
    const session = JSON.parse(sessionCookie.value);
    const userId = session.id_token ? JSON.parse(Buffer.from(session.id_token.split('.')[1], 'base64').toString()).sub : null;
    if (!userId) return false;

    const { data } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single();

    return data?.is_admin || false;
  } catch (e) {
    return false;
  }
}

// GET all prompts
export async function GET(request: NextRequest) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('ai_prompts')
      .select('*')
      .order('slug', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ prompts: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}

// PATCH update prompt
export async function PATCH(request: NextRequest) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, prompt_text, model_override, is_active } = body;

    const { data, error } = await supabaseAdmin
      .from('ai_prompts')
      .update({ 
        prompt_text, 
        model_override, 
        is_active,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, prompt: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 });
  }
}
