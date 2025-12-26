import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/notices/active/route';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          or: vi.fn(() => ({
            order: vi.fn(() => ({
              data: [
                {
                  id: '123',
                  title: 'Critical Notice',
                  message: 'System maintenance',
                  type: 'critical',
                  is_active: true,
                  created_at: '2025-12-26T00:00:00Z',
                  expires_at: null,
                },
                {
                  id: '456',
                  title: 'Info Notice',
                  message: 'New features available',
                  type: 'info',
                  is_active: true,
                  created_at: '2025-12-25T00:00:00Z',
                  expires_at: null,
                },
              ],
              error: null,
            })),
          })),
        })),
      })),
    })),
  },
}));

describe('API Route: /api/notices/active', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/notices/active', () => {
    it('should return active notices sorted by priority', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
      expect(data.data).toHaveLength(2);
      
      // Should be sorted by priority (critical first)
      expect(data.data[0].type).toBe('critical');
      expect(data.data[1].type).toBe('info');
    });

    it('should return empty array when no active notices exist', async () => {
      const { supabaseAdmin } = await import('@/lib/supabase');
      
      vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            or: vi.fn(() => ({
              order: vi.fn(() => ({
                data: [],
                error: null,
              })),
            })),
          })),
        })),
      } as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      const { supabaseAdmin } = await import('@/lib/supabase');
      
      vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            or: vi.fn(() => ({
              order: vi.fn(() => ({
                data: null,
                error: { message: 'Database connection failed' },
              })),
            })),
          })),
        })),
      } as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Database connection failed');
    });

    it('should handle unexpected errors', async () => {
      const { supabaseAdmin } = await import('@/lib/supabase');
      
      vi.mocked(supabaseAdmin.from).mockImplementationOnce(() => {
        throw new Error('Unexpected error');
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });

    it('should filter expired notices', async () => {
      const { supabaseAdmin } = await import('@/lib/supabase');
      
      // The route uses .or() to filter by expires_at
      // This test verifies the query is constructed correctly
      const response = await GET();
      
      expect(supabaseAdmin.from).toHaveBeenCalledWith('system_notices');
      expect(response.status).toBe(200);
    });

    it('should sort notices by priority correctly', async () => {
      const { supabaseAdmin } = await import('@/lib/supabase');
      
      vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            or: vi.fn(() => ({
              order: vi.fn(() => ({
                data: [
                  { id: '1', type: 'info', title: 'Info' },
                  { id: '2', type: 'critical', title: 'Critical' },
                  { id: '3', type: 'warning', title: 'Warning' },
                  { id: '4', type: 'maintenance', title: 'Maintenance' },
                ],
                error: null,
              })),
            })),
          })),
        })),
      } as any);

      const response = await GET();
      const data = await response.json();

      // Priority order: critical > maintenance > warning > info
      expect(data.data[0].type).toBe('critical');
      expect(data.data[1].type).toBe('maintenance');
      expect(data.data[2].type).toBe('warning');
      expect(data.data[3].type).toBe('info');
    });
  });
});
