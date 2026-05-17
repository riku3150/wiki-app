'use client'

import { useState } from 'react'
import Link from 'next/link'

// 受け取るページのデータ型を定義します
type PageNode = {
  id: string;
  title: string;
  slug: string;
  children?: PageNode[]; // 子ページ（再帰的な構造に対応）
}

export default function TreeItem({ page }: { page: PageNode }) {
  // フォルダが開いているかどうかの状態（初期値はfalse＝閉じている）
  const [isOpen, setIsOpen] = useState(false)

  // 子ページを持っているかどうかの判定
  const hasChildren = page.children && page.children.length > 0

  return (
    <div className="mb-1">
      <div className="flex items-center py-1 px-2 rounded-md hover:bg-orange-100 transition group">
        {/* 開閉ボタン（▶） */}
        {hasChildren ? (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-800 transition mr-1"
            aria-label="開閉を切り替える"
          >
            <span className={`transform transition-transform text-xs inline-block ${isOpen ? 'rotate-90' : ''}`}>
              ▶
            </span>
          </button>
        ) : (
          // 子供がいない場合は、矢印の代わりに空白を置いて文字位置を揃えます
          <div className="w-6 h-6 mr-1" />
        )}

        {/* ページ名のリンク（Unityのオブジェクト名部分） */}
        <Link 
          href={`/page/${page.slug}`} 
          className="font-medium text-slate-800 hover:text-blue-600 flex-1"
        >
          {page.title}
        </Link>
      </div>

      {/* 子ページがある、かつ開かれている(isOpen)場合のみ下を描画します */}
      {hasChildren && isOpen && (
        <div className="ml-5 pl-2 border-l border-gray-300">
          {page.children!.map((child) => (
            // ★ここがポイント！自分自身のコンポーネント(TreeItem)を呼び出しています。
            // これにより、将来的に孫ページ、ひ孫ページができても自動的に対応できます。
            <TreeItem key={child.id} page={child} />
          ))}
        </div>
      )}
    </div>
  )
}