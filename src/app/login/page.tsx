'use client'

import { createClient } from '@/lib/supabase/client'
// react-iconsからGoogleとDiscordの公式アイコンを呼び出します
import { FcGoogle } from 'react-icons/fc'
import { FaDiscord } from 'react-icons/fa'

export default function LoginPage() {
  // 工程1-1で作ったブラウザ用のSupabaseクライアントを呼び出します
  const supabase = createClient()

  // ログインボタンが押されたときの処理
  const handleLogin = async (provider: 'google' | 'discord') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        // ログイン成功後に戻ってくるURL
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('ログインエラー:', error.message)
      alert('ログイン処理でエラーが発生しました。')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Wikiにログイン</h1>
        <p className="text-gray-600 text-center mb-8 text-sm">
          記事の作成や編集を行うには、アカウント連携が必要です。
        </p>

        <div className="space-y-4">
          {/* Googleログインボタン */}
          <button
            onClick={() => handleLogin('google')}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-md hover:bg-gray-50 transition font-medium shadow-sm"
          >
            {/* 絵文字の代わりに公式アイコンを配置 */}
            <FcGoogle className="text-2xl" />
            Googleでログイン
          </button>

          {/* Discordログインボタン */}
          <button
            onClick={() => handleLogin('discord')}
            className="w-full flex items-center justify-center gap-3 bg-[#5865F2] text-white px-4 py-3 rounded-md hover:bg-[#4752C4] transition font-medium shadow-sm"
          >
            {/* 絵文字の代わりに公式アイコンを配置 */}
            <FaDiscord className="text-2xl" />
            Discordでログイン
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>※許可なくSNSへ投稿されることはありません。</p>
        </div>
      </div>
    </main>
  )
}