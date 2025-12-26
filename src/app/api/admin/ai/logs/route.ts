import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

async function checkAdmin(request: NextRequest) {
  const sessionCookie = request.cookies.get('auth0_session');
  if (!sessionCookie) return false;
  try {
    const session = JSON.parse(sessionCookie.value);
    const userId = session.id_token ? JSON.parse(Buffer.from(session.id_token.split('.')[1], 'base64').toString()).sub : null;
    const { data } = await supabaseAdmin.from('users').select('is_admin').eq('id', userId).single();
    return data?.is_admin || false;
  } catch (e) { return false; }
}

export async function GET(request: NextRequest) {
  if (!(await checkAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const { data, error } = await supabaseAdmin
      .from('ai_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return NextResponse.json({ logs: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
