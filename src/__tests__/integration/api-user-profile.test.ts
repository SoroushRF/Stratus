import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/user/profile/route';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: 'profile-123',
              user_id: 'auth0|123',
              university: 'University of Toronto',
              campus: 'St. George',
              created_at: '2025-12-26T00:00:00Z',
              updated_at: '2025-12-26T00:00:00Z',
            },
            error: null,
          })),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: 'profile-123',
              user_id: 'auth0|123',
              university: 'University of Toronto',
              campus: 'St. George',
            },
            error: null,
          })),
        })),
      })),
    })),
  },
}));

// Helper to create mock session cookie
function createMockSessionCookie() {
  const payload = {
    sub: 'auth0|123',
    email: 'test@example.com',
    name: 'Test User',
    picture: 'https://example.com/pic.jpg',
  };
  
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const session = {
    id_token: `header.${encodedPayload}.signature`,
  };
  
  return JSON.stringify(session);
}

describe('API Route: /api/user/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/user/profile', () => {
    it('should save user profile successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `auth0_session=${createMockSessionCookie()}`,
        },
        body: JSON.stringify({
          university: 'University of Toronto',
          campus: 'St. George',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.profile).toBeDefined();
      expect(data.profile.university).toBe('University of Toronto');
      expect(data.profile.campus).toBe('St. George');
    });

    it('should return 401 when not authenticated', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          university: 'University of Toronto',
          campus: 'St. George',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Not authenticated');
    });

    it('should return 400 when university is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `auth0_session=${createMockSessionCookie()}`,
        },
        body: JSON.stringify({
          campus: 'St. George',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('University and campus are required');
    });

    it('should return 400 when campus is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `auth0_session=${createMockSessionCookie()}`,
        },
        body: JSON.stringify({
          university: 'University of Toronto',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('University and campus are required');
    });

    it('should handle database errors gracefully', async () => {
      const { supabaseAdmin } = await import('@/lib/supabase');
      
      vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
        upsert: vi.fn(() => ({
          data: null,
          error: { message: 'Database connection failed' },
        })),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `auth0_session=${createMockSessionCookie()}`,
        },
        body: JSON.stringify({
          university: 'University of Toronto',
          campus: 'St. George',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to save user');
    });

    it('should upsert user data before profile', async () => {
      const { supabaseAdmin } = await import('@/lib/supabase');
      
      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `auth0_session=${createMockSessionCookie()}`,
        },
        body: JSON.stringify({
          university: 'University of Toronto',
          campus: 'St. George',
        }),
      });

      await POST(request);

      // Should be called twice: once for users, once for user_profiles
      expect(supabaseAdmin.from).toHaveBeenCalledWith('users');
      expect(supabaseAdmin.from).toHaveBeenCalledWith('user_profiles');
    });
  });

  describe('GET /api/user/profile', () => {
    it('should fetch user profile successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'GET',
        headers: {
          'Cookie': `auth0_session=${createMockSessionCookie()}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.profile).toBeDefined();
      expect(data.profile.university).toBe('University of Toronto');
    });

    it('should return 401 when not authenticated', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Not authenticated');
    });

    it('should return null when profile does not exist', async () => {
      const { supabaseAdmin } = await import('@/lib/supabase');
      
      vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { code: 'PGRST116' }, // No rows returned
            })),
          })),
        })),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'GET',
        headers: {
          'Cookie': `auth0_session=${createMockSessionCookie()}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.profile).toBeNull();
    });

    it('should handle database errors', async () => {
      const { supabaseAdmin } = await import('@/lib/supabase');
      
      vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { code: 'PGRST000', message: 'Database error' },
            })),
          })),
        })),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'GET',
        headers: {
          'Cookie': `auth0_session=${createMockSessionCookie()}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch profile');
    });
  });
});
