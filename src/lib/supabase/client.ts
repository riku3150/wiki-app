import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // 環境変数（.env）からSupabaseのURLとAnon Keyを読み込み、
  // ブラウザ側で安全に通信するためのクライアントを作成します
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}