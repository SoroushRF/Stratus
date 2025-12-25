import { NextRequest, NextResponse } from 'next/server';

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
    // ID token format: header.payload.signature
    const idToken = session.id_token;
    const payload = idToken.split('.')[1];
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());

    // Extract user information
    const user = {
      sub: decodedPayload.sub,
      name: decodedPayload.name,
      email: decodedPayload.email,
      picture: decodedPayload.picture,
      nickname: decodedPayload.nickname,
      updated_at: decodedPayload.updated_at,
    };

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error reading session:', error);
    return NextResponse.json({ error: 'Failed to read session' }, { status: 500 });
  }
}
