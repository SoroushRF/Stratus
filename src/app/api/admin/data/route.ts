import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // 1. Security Check: Get user from session cookie
    const sessionCookie = request.cookies.get('auth0_session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify if the user is an admin in the DB
    const session = JSON.parse(sessionCookie.value);
    const userId = session.id_token ? JSON.parse(Buffer.from(session.id_token.split('.')[1], 'base64').toString()).sub : null;
    
    if (!userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const { data: adminCheck } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (!adminCheck?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 2. Fetch High-Level Stats
    const { count: userCount, error: userCountError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: scheduleCount, error: scheduleCountError } = await supabaseAdmin
      .from('schedules')
      .select('*', { count: 'exact', head: true });

    // 3. Fetch User Directory (Joined with Profiles)
    // We'll get the 50 most recent users for the main dashboard
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        name,
        picture,
        created_at,
        user_profiles (
          university,
          campus,
          updated_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (userCountError || scheduleCountError || usersError) {
      console.error('Database Error:', { userCountError, scheduleCountError, usersError });
      return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
    }

    // 4. Calculate Trends/Insights (Mocked for now based on real counts)
    return NextResponse.json({
      stats: {
        totalUsers: userCount || 0,
        totalAnalyses: scheduleCount || 0,
        activeCampuses: 0, // We could count unique campuses here
        failingExtractions: 0 // We don't have a status column yet
      },
      users: users || []
    });

  } catch (error) {
    console.error('Admin API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
