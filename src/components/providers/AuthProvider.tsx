'use client';

import React from 'react';

// @ts-ignore - Auth0 SDK types may not be fully recognized
import { Auth0Provider } from '@auth0/nextjs-auth0/client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <Auth0Provider>{children}</Auth0Provider>;
}
