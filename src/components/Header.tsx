'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'

export default function Header() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  // ログインユーザーの役職（ロール）を保存する状態
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // ユーザーがいる場合は、データベースから役職（ロール）も一緒に取得する
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        setRole(roleData?.role ?? null)
      }
    }
    getUserData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session) {
        setRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // ログインしていない場合（ロゴだけ表示、リンクなし）
  if (!user) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200 p-4 flex justify-between items-center h-16">
        <div className="font-bold text-xl text-gray-800 tracking-wider">Wiki App</div>
      </header>
    )
  }

  const avatarUrl = user.user_metadata.avatar_url
  const userName = user.user_metadata.full_name || user.user_metadata.name || user.email

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 p-4 flex justify-between items-center h-16">
      {/* ロゴをクリックするとホーム画面（/）に戻れるリンクにしました */}
      <Link href="/" className="font-bold text-xl text-gray-800 tracking-wider hover:opacity-80 transition">
        Wiki App
      </Link>
      
      <div className="flex items-center gap-4">
        {/* 作成者(creator)または管理者(admin)だけに表示される「管理画面」への通り道 */}
        {(role === 'creator' || role === 'admin') && (
          <Link 
            href="/admin" 
            className="text-sm bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-700 px-3 py-1.5 rounded-md transition font-medium border border-gray-200"
          >
             管理画面
          </Link>
        )}

        {/* ユーザー情報エリア */}
        <div className="flex items-center gap-2">
          {avatarUrl ? (
            <img src={avatarUrl} alt="User Avatar" className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {userName?.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm text-gray-700 font-medium hidden sm:block">
            {userName}
          </span>
        </div>

        {/* ログアウトボタン */}
        <button
          onClick={handleLogout}
          className="bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 px-3 py-1.5 rounded-md text-sm transition font-medium border border-transparent hover:border-red-200"
        >
          ログアウト
        </button>
      </div>
    </header>
  )
}