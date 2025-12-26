import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
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
