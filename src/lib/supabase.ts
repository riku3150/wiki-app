import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 環境変数が正しく読み込めているか確認し、設定漏れがあればエラーを出します
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabaseの環境変数が設定されていません。.envファイルを確認してください。')
}

// ほかのプログラムからいつでもSupabaseを呼び出せるように、クライアントをエクスポートします
export const supabase = createClient(supabaseUrl, supabaseAnonKey)