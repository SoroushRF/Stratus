import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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
    const userName = decodedPayload.name;
    const userPicture = decodedPayload.picture;

    // Get request body
    const body = await request.json();
    const { fileName, parsedClasses } = body;

    if (!fileName || !parsedClasses) {
      return NextResponse.json({ error: 'File name and parsed classes are required' }, { status: 400 });
    }

    // Ensure user exists in database
    const { error: userError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userId,
        email: userEmail,
        name: userName,
        picture: userPicture,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });

    if (userError) {
      console.error('Error upserting user:', userError);
      return NextResponse.json({ error: 'Failed to save user' }, { status: 500 });
    }

    // Delete all previous schedules for this user
    await supabaseAdmin
      .from('schedules')
      .delete()
      .eq('user_id', userId);

    // Insert new schedule
    const { data, error } = await supabaseAdmin
      .from('schedules')
      .insert({
        user_id: userId,
        file_name: fileName,
        parsed_classes: parsedClasses,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving schedule:', error);
      return NextResponse.json({ error: 'Failed to save schedule' }, { status: 500 });
    }

    return NextResponse.json({ success: true, schedule: data });
  } catch (error) {
    console.error('Error saving schedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    // Get active schedule
    const { data, error } = await supabaseAdmin
      .from('schedules')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching schedule:', error);
      return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
    }

    return NextResponse.json({ schedule: data || null });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
