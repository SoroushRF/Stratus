import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.MOCK_AI === 'true') {
    const cookieStore = await cookies();
    if (cookieStore.get('mock_maintenance')?.value === 'true') {
      return NextResponse.json({
        success: true,
        data: [{
          id: 'mock-maint',
          title: 'System Maintenance',
          message: 'We are currently upgrading our atmospheric sensors. AI analysis is temporarily disabled.',
          type: 'maintenance',
          is_active: true,
          created_at: new Date().toISOString()
        }]
      });
    }
  }
  try {
    const { data, error } = await supabaseAdmin
      .from('system_notices')
      .select('*')
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active notices:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Sort by priority: critical > maintenance > warning > info
    const priorityOrder = { critical: 0, maintenance: 1, warning: 2, info: 3 };
    const sortedNotices = (data || []).sort((a, b) => {
      const aPriority = priorityOrder[a.type as keyof typeof priorityOrder] ?? 999;
      const bPriority = priorityOrder[b.type as keyof typeof priorityOrder] ?? 999;
      return aPriority - bPriority;
    });

    return NextResponse.json({ success: true, data: sortedNotices });
  } catch (error) {
    console.error('Unexpected error fetching notices:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
