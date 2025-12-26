import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import universitiesData from '@/lib/data/universities.json';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting university migration...');
    
    // Process in batches to avoid timeouts
    const batchSize = 100;
    const total = universitiesData.length;
    let count = 0;

    for (let i = 0; i < total; i += batchSize) {
      const batch = universitiesData.slice(i, i + batchSize).map(uni => ({
        name: uni.name,
        short_name: uni.shortName,
        campus: uni.campus,
        lat: uni.lat,
        lng: uni.lng
      }));

      const { error } = await supabaseAdmin
        .from('universities')
        .upsert(batch, { onConflict: 'name,campus' }); // Assuming name+campus is unique

      if (error) {
        console.error('Batch error:', error);
        throw error;
      }
      count += batch.length;
      console.log(`✅ Migrated ${count}/${total} universities`);
    }

    return NextResponse.json({ success: true, migrated: count });
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json({ error: 'Migration failed', details: error }, { status: 500 });
  }
}
