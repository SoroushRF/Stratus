import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get user from session cookie
    const sessionCookie = request.cookies.get('auth0_session');
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const idToken = session.id_token;
    const payload = idToken.split('.')[1];
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
    
    const userId = decodedPayload.sub;

    // Get user info
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user:', error);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }

    return NextResponse.json({ user: data || null });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from session cookie
    const sessionCookie = request.cookies.get('auth0_session');
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const idToken = session.id_token;
    const payload = idToken.split('.')[1];
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
    
    const userId = decodedPayload.sub;
    const userEmail = decodedPayload.email;
    const userPicture = decodedPayload.picture;

    // Get request body
    const body = await request.json();
    const { firstName, lastName } = body;

    // Update user info
    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userId,
        email: userEmail,
        picture: userPicture,
        first_name: firstName,
        last_name: lastName,
        name: `${firstName} ${lastName}`.trim(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
