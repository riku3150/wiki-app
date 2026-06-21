'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import DrawerMenu from '@/components/DrawerMenu'

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
      <header className="bg-white shadow-sm border-b border-gray-200 p-4 flex items-center h-16">
        <div className="font-bold text-xl text-gray-800 tracking-wider">Wiki App</div>
      </header>
    )
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 p-4 flex items-center gap-3 h-16">
      {/* メニューボタンとロゴを横並びに配置します */}
      <DrawerMenu user={user} role={role} handleLogout={handleLogout} />
      
      {/* ロゴをクリックするとホーム画面（/）に戻れるリンク */}
      <Link href="/" className="font-bold text-xl text-gray-800 tracking-wider hover:opacity-80 transition">
        Wiki App
      </Link>
    </header>
  )
}