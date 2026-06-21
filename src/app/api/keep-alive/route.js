import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  // Supabaseに接続
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // データベースを起こすために、あえて適当なアクセスを1回行う
  // （※データが空でも、エラーになっても、アクセスした時点で起きるのでOKです）
  const { data, error } = await supabase.from('users').select('id').limit(1);

  return NextResponse.json({ 
    status: 'ok', 
    message: 'Supabaseの起床確認ヨシ！' 
  });
}