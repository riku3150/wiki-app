'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DrawerMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* スマホでも押しやすい、右上のハンバーガー（メニュー）ボタン */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 p-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* 背景の暗転（オーバーレイ） */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 右からスライドしてくるドロワー本体 */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
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

          <nav className="flex flex-col gap-4">
            <Link 
              href="/" 
              onClick={() => setIsOpen(false)}
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              🏠 トップページ
            </Link>
            <Link 
              href="/new" 
              onClick={() => setIsOpen(false)}
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              📝 新規作成
            </Link>
            {/* 今後ここにプロフィール設定などのメニューを追加していきます */}
          </nav>
        </div>
      </div>
    </>
  )
}