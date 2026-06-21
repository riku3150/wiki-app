'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'

interface DrawerMenuProps {
  user: User | null
  role: string | null
  handleLogout: () => Promise<void>
}

export default function DrawerMenu({ user, role, handleLogout }: DrawerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  // ログインしていない場合はメニューボタン自体を表示しません
  if (!user) return null

  const avatarUrl = user.user_metadata.avatar_url
  const userName = user.user_metadata.full_name || user.user_metadata.name || user.email

  return (
    <>
      {/* 三本線（メニュー）ボタン。fixedを外してヘッダー内でロゴと横並びにできるようにします */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* 背景の暗転（オーバーレイ） */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 左からスライドしてくるドロワー本体 */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 h-full flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-gray-800">メニュー</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-800 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* ヘッダーから引っ越してきたユーザー情報エリア */}
            <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
              {avatarUrl ? (
                <img src={avatarUrl} alt="User Avatar" className="w-10 h-10 rounded-full border border-gray-200 object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {userName?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm text-gray-800 font-semibold break-all">
                {userName}
              </span>
            </div>

            <nav className="flex flex-col gap-3">
              <Link 
                href="/" 
                onClick={() => setIsOpen(false)}
                className="text-gray-700 hover:text-blue-600 font-medium py-2 px-3 hover:bg-gray-50 rounded-md transition"
              >
                🏠 トップページ
              </Link>
              <Link 
                href="/new" 
                onClick={() => setIsOpen(false)}
                className="text-gray-700 hover:text-blue-600 font-medium py-2 px-3 hover:bg-gray-50 rounded-md transition"
              >
                📝 新規作成
              </Link>
              
              {/* ヘッダーから引っ越してきた管理画面へのリンク */}
              {(role === 'creator' || role === 'admin') && (
                <Link 
                  href="/admin" 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-700 hover:text-blue-600 font-medium py-2 px-3 hover:bg-gray-50 rounded-md transition"
                >
                  ⚙️ 管理画面
                </Link>
              )}
            </nav>
          </div>

          {/* ヘッダーから引っ越してきたログアウトボタンを最下部に配置 */}
          <div className="border-t pt-4">
            <button
              onClick={() => {
                setIsOpen(false)
                handleLogout()
              }}
              className="w-full bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 py-2.5 rounded-md text-sm transition font-medium border border-transparent hover:border-red-200 text-center"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </>
  )
}