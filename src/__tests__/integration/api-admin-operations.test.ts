import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/admin/operations/route';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        in: vi.fn(() => ({
          data: [
            { key: 'maintenance_mode', value: 'false' },
            { key: 'tomorrow_api_usage_daily', value: 10 },
            { key: 'tomorrow_api_limit', value: 500 },
          ],
          error: null,
        })),
        order: vi.fn(() => ({
          data: [
            { id: '1', title: 'Notice 1', created_at: '2025-12-25T00:00:00Z' },
          ],
          error: null,
        })),
        not: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              data: [
                { prompt_tokens: 100, completion_tokens: 50, model_used: 'gemini-1.5-flash', created_at: '2025-12-26T00:00:00Z' },
              ],
              error: null,
            })),
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null,
        })),
      })),
      insert: vi.fn(() => ({
        error: null,
      })),
    })),
  },
}));

describe('API Route: /api/admin/operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/admin/operations', () => {
    it('should fetch config data when type=config', async () => {
      const request = new Request('http://localhost:3000/api/admin/operations?type=config');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.config.maintenance_mode).toBe('false');
    });

    it('should fetch notices when type=notices', async () => {
      const request = new Request('http://localhost:3000/api/admin/operations?type=notices');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.notices).toHaveLength(1);
    });

    it('should fetch analytics when type=analytics', async () => {
      const request = new Request('http://localhost:3000/api/admin/operations?type=analytics');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.analytics.totalTokens).toBe(150);
      expect(data.analytics.byModel['gemini-1.5-flash']).toBeDefined();
    });

    it('should return 400 for invalid type', async () => {
      const request = new Request('http://localhost:3000/api/admin/operations?type=invalid');
      const response = await GET(request);
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/admin/operations', () => {
    it('should toggle maintenance mode', async () => {
      const request = new Request('http://localhost:3000/api/admin/operations', {
        method: 'POST',
        body: JSON.stringify({ action: 'maintenance', enabled: true }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should create a notice', async () => {
      const request = new Request('http://localhost:3000/api/admin/operations', {
        method: 'POST',
        body: JSON.stringify({ 
          action: 'create_notice', 
          title: 'Test Notice', 
          message: 'Test Message', 
          type: 'info' 
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should toggle a notice', async () => {
      const request = new Request('http://localhost:3000/api/admin/operations', {
        method: 'POST',
        body: JSON.stringify({ action: 'toggle_notice', id: '1', is_active: false }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 400 for invalid action', async () => {
      const request = new Request('http://localhost:3000/api/admin/operations', {
        method: 'POST',
        body: JSON.stringify({ action: 'invalid' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });
});
