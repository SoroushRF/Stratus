import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const auth0Route = request.nextUrl.pathname.split('/').pop();

  // Redirect to Auth0 login
  if (auth0Route === 'login') {
    const domain = process.env.AUTH0_DOMAIN;
    const clientId = process.env.AUTH0_CLIENT_ID;
    
    // Dynamically determine the base URL from the request
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    const redirectUri = `${baseUrl}/api/auth/callback`;
    
    console.log('Auth0 Login - Domain:', domain);
    console.log('Auth0 Login - Client ID:', clientId);
    console.log('Auth0 Login - Base URL:', baseUrl);
    console.log('Auth0 Login - Redirect URI:', redirectUri);
    
    const authUrl = `https://${domain}/authorize?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=openid profile email`;
    
    console.log('Auth0 Login - Full Auth URL:', authUrl);
    
    return NextResponse.redirect(authUrl);
  }

  // Handle callback
  if (auth0Route === 'callback') {
    const code = searchParams.get('code');
    
    // Dynamically determine the base URL from the request
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    
    if (!code) {
      return NextResponse.redirect(`${baseUrl}?error=no_code`);
    }

    // Exchange code for tokens
    const tokenResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        code,
        redirect_uri: `${baseUrl}/api/auth/callback`,
      }),
    });

    const tokens = await tokenResponse.json();
    
    // Set session cookie and redirect
    const response = NextResponse.redirect(baseUrl);
    response.cookies.set('auth0_session', JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    return response;
  }

  // Handle logout
  if (auth0Route === 'logout') {
    console.log('🚪 Logging out...');
    const response = NextResponse.json({ success: true });
    
    // Delete the session cookie by setting it to expire
    response.cookies.set('auth0_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      expires: new Date(0), // Set to past date
    });
    
    console.log('✅ Session cookie cleared');
    return response;
  }

  return NextResponse.json({ error: 'Invalid route' }, { status: 404 });
}
