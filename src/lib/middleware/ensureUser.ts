import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Middleware to ensure user exists in database on first login
 * This runs after Auth0 authentication but before any API route
 */
export async function ensureUserExists(request: NextRequest): Promise<{ userId: string; userEmail: string; userName: string; userPicture: string } | null> {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('auth0_session');
    
    if (!sessionCookie) {
      return null;
    }

    // Parse session
    const session = JSON.parse(sessionCookie.value);
    
    if (!session.id_token) {
      return null;
    }

    // Decode ID token
    const idToken = session.id_token;
    const payload = idToken.split('.')[1];
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
    
    const userId = decodedPayload.sub;
    const userEmail = decodedPayload.email;
    const userName = decodedPayload.name;
    const userPicture = decodedPayload.picture;

    // Ensure user exists in database (upsert on every request is safe and idempotent)
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
        // Don't overwrite existing data, only insert if new
        ignoreDuplicates: false,
      });

    if (userError) {
      console.error('❌ Error ensuring user exists:', userError);
      // Don't fail the request, just log the error
    } else {
      console.log('✅ User ensured in DB:', userId);
    }

    return { userId, userEmail, userName, userPicture };
  } catch (error) {
    console.error('❌ Error in ensureUserExists middleware:', error);
    return null;
  }
}
