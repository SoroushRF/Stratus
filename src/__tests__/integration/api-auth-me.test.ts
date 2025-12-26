import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/auth/me/route';

// Mock ensureUserExists
vi.mock('@/lib/middleware/ensureUser', () => ({
  ensureUserExists: vi.fn().mockResolvedValue({
    userId: 'auth0|123',
    userEmail: 'test@example.com',
    userName: 'Test User',
    userPicture: 'https://example.com/pic.jpg',
  }),
}));

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              first_name: 'Test',
              last_name: 'User',
              name: 'Test User',
              is_admin: true,
            },
            error: null,
          })),
        })),
      })),
    })),
  },
}));

describe('API Route: /api/auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user info successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/me');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sub).toBe('auth0|123');
    expect(data.name).toBe('Test User');
    expect(data.is_admin).toBe(true);
  });

  it('should handle authenticated user without custom name', async () => {
    const { supabaseAdmin } = await import('@/lib/supabase');
    vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              first_name: null,
              last_name: null,
              name: null,
              is_admin: false,
            },
            error: null,
          })),
        })),
      })),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/auth/me');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBe('Test User'); // Falls back to Auth0 name
    expect(data.is_admin).toBe(false);
  });

  it('should return 401 when not authenticated', async () => {
    const { ensureUserExists } = await import('@/lib/middleware/ensureUser');
    vi.mocked(ensureUserExists).mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost:3000/api/auth/me');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Not authenticated');
  });

  it('should handle internal errors', async () => {
    const { ensureUserExists } = await import('@/lib/middleware/ensureUser');
    vi.mocked(ensureUserExists).mockRejectedValueOnce(new Error('Internal error'));

    const request = new NextRequest('http://localhost:3000/api/auth/me');
    const response = await GET(request);

    expect(response.status).toBe(500);
  });
});
