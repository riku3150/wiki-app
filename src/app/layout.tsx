import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'

// フォントの設定（Next.jsの標準機能）
const inter = Inter({ subsets: ['latin'] })

// サイトのタイトルなどのメタデータ設定
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
        {/* ここに先ほど作った共通ヘッダーを配置します */}
        <Header />
        
        {/* 各ページのコンテンツ（ログイン画面やWikiの中身）がここに入ります */}
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}