import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  // アクセスされたURLから情報を取り出す
  const { searchParams, origin } = new URL(request.url)
  // Supabaseから送られてくる認証コードを取得
  const code = searchParams.get('code')
  // ログイン後に元のページに戻るためのURL（指定がなければホームへ）
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    
    // サーバー用のSupabaseクライアントを作成し、クッキーの読み書きを設定
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // サーバーの処理中にエラーが起きた場合のもみ消し用
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              // サーバーの処理中にエラーが起きた場合のもみ消し用
            }
          },
        },
      }
    )

    // 送られてきたコードを正式なセッション（ログイン状態）に交換する
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 交換に成功したら、目的のページ（Wikiのトップなど）へリダイレクト
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('認証エラー:', error.message)
    }
  }

  // もしコードが無かったり、エラーが起きた場合はログイン画面に追い返す
  return NextResponse.redirect(`${origin}/login?error=CouldNotAuthenticate`)
}