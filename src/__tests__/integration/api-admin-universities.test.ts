import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, PATCH, DELETE } from '@/app/api/admin/universities/route';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [{ id: '1', name: 'University of Toronto' }],
          error: null,
        })),
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { is_admin: true },
            error: null,
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: '2', name: 'Waterloo' },
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { id: '1', name: 'UofT Updated' },
              error: null,
            })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null,
        })),
      })),
    })),
  },
}));

// Helper to create mock session cookie
function createMockSessionCookie() {
  const payload = { sub: 'auth0|123' };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const session = { id_token: `header.${encodedPayload}.signature` };
  return JSON.stringify(session);
}

describe('API Route: /api/admin/universities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/admin/universities', () => {
    it('should fetch all universities', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/universities');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.universities).toHaveLength(1);
    });
  });

  describe('POST /api/admin/universities', () => {
    it('should create a university for admin', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/universities', {
        method: 'POST',
        headers: {
          'Cookie': `auth0_session=${createMockSessionCookie()}`,
        },
        body: JSON.stringify({ name: 'Waterloo', short_name: 'UW', campus: 'Main', lat: 43.4, lng: -80.5 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 403 for non-admin', async () => {
      const { supabaseAdmin } = await import('@/lib/supabase');
      vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { is_admin: false },
              error: null,
            })),
          })),
        })),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/admin/universities', {
        method: 'POST',
        headers: {
          'Cookie': `auth0_session=${createMockSessionCookie()}`,
        },
        body: JSON.stringify({ name: 'Waterloo' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/admin/universities', () => {
    it('should update a university', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/universities', {
        method: 'PATCH',
        headers: {
          'Cookie': `auth0_session=${createMockSessionCookie()}`,
        },
        body: JSON.stringify({ id: '1', name: 'UofT Updated' }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('DELETE /api/admin/universities', () => {
    it('should delete a university', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/universities?id=1', {
        method: 'DELETE',
        headers: {
          'Cookie': `auth0_session=${createMockSessionCookie()}`,
        },
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
