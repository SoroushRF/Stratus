import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from '@/lib/supabase';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function checkAdmin(request: NextRequest) {
  const sessionCookie = request.cookies.get('auth0_session');
  if (!sessionCookie) return false;
  try {
    const session = JSON.parse(sessionCookie.value);
    const userId = session.id_token ? JSON.parse(Buffer.from(session.id_token.split('.')[1], 'base64').toString()).sub : null;
    const { data } = await supabaseAdmin.from('users').select('is_admin').eq('id', userId).single();
    return data?.is_admin || false;
  } catch (e) { return false; }
}

export async function POST(request: NextRequest) {
  if (!(await checkAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const { prompt, model: modelName, sampleInput } = await request.json();

    const modelProvider = genAI.getGenerativeModel({ model: modelName || "gemini-2.0-flash-exp" });
    
    // Simulate content generation for testing
    // If sampleInput is base64, we treat it as image (for schedule parser)
    // If it's plain text, we treat it as text (for attire advisor)
    
    let result;
    if (sampleInput.startsWith('data:image') || sampleInput.length > 1000) { // Naive check for base64 or long text
       // Handle possible base64
       const base64Data = sampleInput.includes(',') ? sampleInput.split(',')[1] : sampleInput;
       const mimeType = sampleInput.includes(';') ? sampleInput.split(';')[0].split(':')[1] : 'image/jpeg';
       
       result = await modelProvider.generateContent([
         prompt,
         {
           inlineData: {
             data: base64Data,
             mimeType: mimeType,
           },
         },
       ]);
    } else {
       result = await modelProvider.generateContent(prompt + "\n\nINPUT DATA:\n" + sampleInput);
    }

    const text = result.response.text();
    return NextResponse.json({ output: text });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
