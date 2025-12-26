import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/user/schedule/route';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      upsert: vi.fn(() => ({
        error: null,
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null,
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: 'schedule-123',
              user_id: 'auth0|123',
              file_name: 'test-schedule.png',
              parsed_classes: [{ name: 'Test Class', startTime: '09:00', endTime: '10:00', days: ['MONDAY'] }],
              is_active: true,
              uploaded_at: '2025-12-26T00:00:00Z',
            },
            error: null,
          })),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                single: vi.fn(() => ({
                  data: {
                    id: 'schedule-123',
                    user_id: 'auth0|123',
                    file_name: 'test-schedule.png',
                    parsed_classes: [{ name: 'Test Class', startTime: '09:00', endTime: '10:00', days: ['MONDAY'] }],
                    is_active: true,
                  },
                  error: null,
                })),
              })),
            })),
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

describe('API Route: /api/user/schedule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/user/schedule', () => {
    it('should save schedule successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `auth0_session=${createMockSessionCookie()}`,
        },
        body: JSON.stringify({
          fileName: 'test-schedule.png',
          parsedClasses: [{ name: 'Test Class', startTime: '09:00', endTime: '10:00', days: ['MONDAY'] }],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.schedule.file_name).toBe('test-schedule.png');
    });

    it('should return 401 when not authenticated', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: 'test-schedule.png',
          parsedClasses: [],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
    });

    it('should return 400 when body is missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `auth0_session=${createMockSessionCookie()}`,
        },
        body: JSON.stringify({
          fileName: 'test-schedule.png',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/user/schedule', () => {
    it('should fetch active schedule successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/schedule', {
        method: 'GET',
        headers: {
          'Cookie': `auth0_session=${createMockSessionCookie()}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.schedule).toBeDefined();
      expect(data.schedule.file_name).toBe('test-schedule.png');
    });

    it('should return null when no schedule exists', async () => {
      const { supabaseAdmin } = await import('@/lib/supabase');
      
      vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => ({
                  single: vi.fn(() => ({
                    data: null,
                    error: { code: 'PGRST116' },
                  })),
                })),
              })),
            })),
          })),
        })),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/user/schedule', {
        method: 'GET',
        headers: {
          'Cookie': `auth0_session=${createMockSessionCookie()}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.schedule).toBeNull();
    });
  });
});
