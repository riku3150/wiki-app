import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import ChatWidget from '@/components/ChatWidget'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Wiki App',
  description: 'Private Wiki Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {/* ヘッダー（メニューボタンを含む） */}
        <Header />
        
        {/* 各ページのコンテンツが入るエリア */}
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>

        {/* 🤖 右下に浮いているAIチャットウィジェットを追加！ */}
        <ChatWidget />
      </body>
    </html>
  )
}