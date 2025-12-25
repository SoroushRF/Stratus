import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const auth0Route = request.nextUrl.pathname.split('/').pop();

  // Redirect to Auth0 login
  if (auth0Route === 'login') {
    const domain = process.env.AUTH0_DOMAIN;
    const clientId = process.env.AUTH0_CLIENT_ID;
    const redirectUri = `${process.env.APP_BASE_URL}/api/auth/callback`;
    
    console.log('Auth0 Login - Domain:', domain);
    console.log('Auth0 Login - Client ID:', clientId);
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
    
    if (!code) {
      return NextResponse.redirect(`${process.env.APP_BASE_URL}?error=no_code`);
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
        redirect_uri: `${process.env.APP_BASE_URL}/api/auth/callback`,
      }),
    });

    const tokens = await tokenResponse.json();
    
    // Set session cookie and redirect
    const response = NextResponse.redirect(process.env.APP_BASE_URL!);
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
    const response = NextResponse.redirect(process.env.APP_BASE_URL!);
    response.cookies.delete('auth0_session');
    return response;
  }

  return NextResponse.json({ error: 'Invalid route' }, { status: 404 });
}
