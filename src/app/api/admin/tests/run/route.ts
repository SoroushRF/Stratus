import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // 1. Security Check: Same as other admin routes
    const sessionCookie = request.cookies.get('auth0_session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const userId = session.id_token ? JSON.parse(Buffer.from(session.id_token.split('.')[1], 'base64').toString()).sub : null;
    
    if (!userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const { data: adminCheck } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (!adminCheck?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 2. Process Command
    const { testType } = await request.json(); // 'unit' or 'e2e'
    
    if (testType !== 'unit' && testType !== 'e2e') {
      return NextResponse.json({ error: 'Invalid test type' }, { status: 400 });
    }

    const command = testType === 'unit' ? 'npm' : 'npx';
    const argsItems = testType === 'unit' ? ['run', 'test'] : ['playwright', 'test', '--reporter=list'];

    return new Response(
      new ReadableStream({
        start(controller) {
          const child = spawn(command, argsItems, {
            shell: true,
            env: { ...process.env } 
          });

          child.stdout.on('data', (data) => {
            controller.enqueue(data);
          });

          child.stderr.on('data', (data) => {
            controller.enqueue(data);
          });

          child.on('close', (code) => {
            controller.enqueue(`\n[PROCESS_COMPLETED_WITH_CODE_${code}]`);
            controller.close();
          });

          child.on('error', (err) => {
            controller.enqueue(`\n[PROCESS_ERROR_${err.message}]`);
            controller.close();
          });
        },
      }),
      {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      }
    );
  } catch (error: any) {
    console.error('Test run error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
