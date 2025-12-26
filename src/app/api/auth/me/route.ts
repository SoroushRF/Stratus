import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('auth0_session');
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Parse the session
    const session = JSON.parse(sessionCookie.value);
    
    if (!session.id_token) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Decode the ID token (JWT) to get user info
    const idToken = session.id_token;
    const payload = idToken.split('.')[1];
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());

    const userId = decodedPayload.sub;

    // Fetch user from Supabase to get custom name and admin status
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('users')
      .select('first_name, last_name, name, is_admin')
      .eq('id', userId)
      .single();

    // Determine the name to show: DB First + Last, or DB Name, or Auth0 Name
    let displayName = decodedPayload.name;
    
    if (dbUser) {
      if (dbUser.first_name || dbUser.last_name) {
        displayName = `${dbUser.first_name || ''} ${dbUser.last_name || ''}`.trim();
      } else if (dbUser.name) {
        displayName = dbUser.name;
      }
    }

    // Extract user information
    const user = {
      sub: userId,
      name: displayName,
      email: decodedPayload.email,
      picture: decodedPayload.picture,
      nickname: decodedPayload.nickname,
      is_admin: dbUser?.is_admin || false,
      updated_at: decodedPayload.updated_at,
    };

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error reading session:', error);
    return NextResponse.json({ error: 'Failed to read session' }, { status: 500 });
  }
}
