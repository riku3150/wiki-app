'use client'

import { useEffect, useState } from 'react'

// 見出しの情報を管理するための型定義
interface Heading {
  id: string
  text: string
  level: number
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    let observer: IntersectionObserver | null = null

    // BlockNoteの描画完了を待つため、0.5秒遅延させてから見出しを探します
    const timer = setTimeout(() => {
      const contentElement = document.querySelector('.article-content')
      if (!contentElement) return

      // 💡 修正ポイント: BlockNoteの不要なラッパー（枠）を拾わないよう、純粋な h1, h2, h3 のみに絞りました
      const elements = Array.from(
        contentElement.querySelectorAll('h1, h2, h3')
      )

      // それでも見出しが見つからなければ処理を終了
      if (elements.length === 0) return

      const rawHeadings: Heading[] = elements.map((elem, index) => {
        // 見出しにIDがない場合は自動付与
        if (!elem.id) {
          elem.id = `heading-${index}`
        }
        
        return {
          id: elem.id,
          // 余計な空白を削除
          text: elem.textContent?.trim() || '',
          // H1なら1、H2なら2を抽出
          level: Number(elem.tagName.replace('H', ''))
        }
      })

      // 💡 修正ポイント: 空っぽの見出しだけを除外し、ユーザーが意図的に同じ名前の見出しを作った場合はそのまま残すようにしました
      const validHeadings = rawHeadings.filter(heading => heading.text !== '')

      setHeadings(validHeadings)

      // スクロール時のハイライト設定
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id)
            }
          })
        },
        { rootMargin: '-20% 0px -80% 0px' } 
      )

      elements.forEach((elem) => observer?.observe(elem))
    }, 500)

    // クリーンアップ処理
    return () => {
      clearTimeout(timer)
      if (observer) {
        observer.disconnect()
      }
    }
  }, [])

  if (headings.length === 0) {
    return null
  }

  return (
    <div className="sticky top-8 max-h-[calc(100vh-6rem)] overflow-y-auto bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        <h3 className="font-bold text-gray-800">目次</h3>
      </div>
      <ul className="space-y-1.5 text-sm">
        {headings.map((heading) => (
          <li 
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 1) * 1}rem` }}
          >
            <a
              href={`#${heading.id}`}
              className={`block py-1.5 px-3 rounded-lg transition-colors duration-200 ${
                activeId === heading.id 
                  ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600 pl-2' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent pl-2'
              }`}
              onClick={(e) => {
                e.preventDefault()
                const target = document.getElementById(heading.id)
                if (target) {
                  const y = target.getBoundingClientRect().top + window.scrollY - 80
                  window.scrollTo({ top: y, behavior: 'smooth' })
                }
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}