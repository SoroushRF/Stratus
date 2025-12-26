import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ensureUserExists } from '@/lib/middleware/ensureUser';

export async function GET(request: NextRequest) {
  try {
    // Ensure user exists in DB (this will create them if it's their first login)
    const userInfo = await ensureUserExists(request);
    
    if (!userInfo) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { userId, userEmail, userName, userPicture } = userInfo;

    // Fetch user from Supabase to get custom name and admin status
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('users')
      .select('first_name, last_name, name, is_admin')
      .eq('id', userId)
      .single();

    // Determine the name to show: DB First + Last, or DB Name, or Auth0 Name
    let displayName = userName;
    
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
      email: userEmail,
      picture: userPicture,
      is_admin: dbUser?.is_admin || false,
    };

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error reading session:', error);
    return NextResponse.json({ error: 'Failed to read session' }, { status: 500 });
  }
}
