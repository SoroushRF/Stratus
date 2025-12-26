import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper to check admin status
async function checkAdmin(request: NextRequest) {
  const sessionCookie = request.cookies.get('auth0_session');
  if (!sessionCookie) return false;

  try {
    const session = JSON.parse(sessionCookie.value);
    const idToken = session.id_token;
    const payload = idToken.split('.')[1];
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
    const userId = decodedPayload.sub;

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single();

    return data?.is_admin || false;
  } catch (e) {
    return false;
  }
}

// GET all universities
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('universities')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ universities: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 500 });
  }
}

// POST new university
export async function POST(request: NextRequest) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, short_name, campus, lat, lng } = body;

    const { data, error } = await supabaseAdmin
      .from('universities')
      .insert({ name, short_name, campus, lat, lng })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, university: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create university' }, { status: 500 });
  }
}

// PATCH update university
export async function PATCH(request: NextRequest) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, name, short_name, campus, lat, lng } = body;

    const { data, error } = await supabaseAdmin
      .from('universities')
      .update({ name, short_name, campus, lat, lng, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, university: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update university' }, { status: 500 });
  }
}

// DELETE university
export async function DELETE(request: NextRequest) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('universities')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete university' }, { status: 500 });
  }
}
