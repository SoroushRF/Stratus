import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('auth0_session');
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const idToken = session.id_token;
    const payload = idToken.split('.')[1];
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
    
    const userId = decodedPayload.sub;

    console.log('Deleting user account:', userId);

    // Delete user from all relevant tables
    // cascading deletes should handle related tables if foreign keys are set to ON DELETE CASCADE
    // but let's be explicit to be safe
    
    // 1. Delete schedules
    await supabaseAdmin
      .from('schedules')
      .delete()
      .eq('user_id', userId);

    // 2. Delete user profiles
    await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);

    // 3. Finally delete the user record itself
    const { error: userError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (userError) {
      console.error('Error deleting user:', userError);
      return NextResponse.json({ error: 'Failed to delete user record', details: userError.message }, { status: 500 });
    }

    console.log('User account deleted successfully from DB');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in account deletion:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
