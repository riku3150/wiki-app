import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function PendingPage() {
  const cookieStore = await cookies()
  
  // サーバー側でSupabaseクライアントを初期化
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // 現在ログインしているユーザー情報を取得
  const { data: { user } } = await supabase.auth.getUser()

  // ログインしていない場合はログイン画面へ弾く
  if (!user) {
    redirect('/login')
  }

  // ユーザーの現在の権限（ロール）を取得
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('id', user.id)
    .single()

  // 既に承認されている（pendingではない）場合は、ホーム画面へ通す
  if (roleData && roleData.role !== 'pending') {
    redirect('/')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold mb-4">承認待ちです</h1>
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          ログインは完了しましたが、現在このWikiへの参加は管理者による承認待ち状態となっています。<br />
          管理者に権限の付与をリクエストしてください。
        </p>
        <div className="p-4 bg-blue-50 rounded-md text-blue-800 text-sm mb-6">
          あなたのアカウント: {user.email || 'メールアドレス非公開（Discord等）'}
        </div>
      </div>
    </main>
  )
}