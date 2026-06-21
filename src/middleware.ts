import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // リクエストの情報を引き継ぎつつ、レスポンスの準備をする
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // ミドルウェア用のSupabaseクライアントを作成（新しいCookie処理の書き方）
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // ここがCookie分割バグを防ぐための最も重要なアップデート部分です
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 現在アクセスしてきているユーザーの情報を取得
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // ログイン画面や認証コールバックの通信は、チェックをスキップする（無限ループ防止）
  if (
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/auth')
  ) {
    return supabaseResponse
  }

  // ユーザーがログインしていない場合、問答無用でログイン画面へ飛ばす
  if (!user) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // ログイン済みの場合、データベースからその人の権限（ロール）を取得する
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isPendingPage = url.pathname.startsWith('/pending')
  const role = roleData?.role

  // 権限が「pending（承認待ち）」の人が、pendingページ以外を見ようとしたら強制送還
  if (role === 'pending' && !isPendingPage) {
    url.pathname = '/pending'
    return NextResponse.redirect(url)
  }

  // すでに承認されている（pendingではない）人が、pendingページに行こうとしたらホームへ戻す
  if (role !== 'pending' && isPendingPage) {
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // すべてのチェックを通過した安全なアクセスのみ許可する
  return supabaseResponse
}

// このミドルウェア（見張り番）を動作させる対象のページを指定
export const config = {
  matcher: [
    /*
     * 以下のパスを除外して、すべてのリクエストで見張り番を立たせる
     * - _next/static (システム用の静的ファイル)
     * - _next/image (画像最適化)
     * - favicon.ico (アイコン)
     * - 画像などの各種ファイル拡張子
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}