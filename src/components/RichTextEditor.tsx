'use client'

import { useEffect, useState } from 'react'
import { BlockNoteEditor, PartialBlock } from '@blocknote/core'
import { ja } from '@blocknote/core/locales'
import { BlockNoteView } from '@blocknote/mantine'
import { SuggestionMenuController } from '@blocknote/react'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'

export default function RichTextEditor({ defaultValue = '' }: { defaultValue?: string | null }) {
  const [content, setContent] = useState(defaultValue || '')
  const [editor, setEditor] = useState<BlockNoteEditor | null>(null)

  const [pages, setPages] = useState<{ id: string, title: string, slug: string }[]>([])

  useEffect(() => {
    fetch('/api/pages')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPages(data)
        }
      })
      .catch(err => console.error("ページ一覧の取得に失敗しました", err))
  }, [])

  useEffect(() => {
    async function initEditor() {
      let initialBlocks: PartialBlock[] | undefined = undefined

      if (typeof defaultValue === 'string' && defaultValue.length > 0) {
        try {
          initialBlocks = JSON.parse(defaultValue)
        } catch (error) {
          try {
            const tempEditor = BlockNoteEditor.create()
            initialBlocks = await tempEditor.tryParseHTMLToBlocks(defaultValue)
          } catch (htmlError) {
            console.error('データの読み込みエラー:', htmlError)
          }
        }
      }

      const newEditor = BlockNoteEditor.create({
        initialContent: initialBlocks,
        dictionary: ja,
        uploadFile: async (file) => {
          const formData = new FormData()
          formData.append('file', file)

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })
          const data = await response.json()
          
          if (data.error) throw new Error(data.error)
          return data.url
        },
      })

      setEditor(newEditor)
    }

    initEditor()
  }, [defaultValue])

  const setHeading = (level: 1 | 2 | 3) => {
    if (!editor) return
    const cursor = editor.getTextCursorPosition()
    if (cursor) {
      editor.updateBlock(cursor.block, { type: "heading", props: { level } })
      editor.focus()
    }
  }

  const setParagraph = () => {
    if (!editor) return
    const cursor = editor.getTextCursorPosition()
    if (cursor) {
      editor.updateBlock(cursor.block, { type: "paragraph" })
      editor.focus()
    }
  }

  const toggleStyle = (style: 'bold' | 'italic' | 'underline' | 'strike') => {
    if (!editor) return
    editor.toggleStyles({ [style]: true })
    editor.focus()
  }

  if (!editor) {
    return (
      <div className="border border-gray-300 rounded-md bg-gray-50 flex items-center justify-center min-h-[400px] text-gray-500">
        エディタを準備中...
      </div>
    )
  }

  return (
    <div>
      <textarea
        name="body"
        value={content}
        readOnly
        className="hidden"
      />

      <div className="border border-gray-300 rounded-md overflow-hidden bg-white min-h-[400px] flex flex-col">
        
        <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-500 font-bold ml-1">文字サイズ:</span>
          <button type="button" onClick={() => setHeading(1)} className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 font-bold">大</button>
          <button type="button" onClick={() => setHeading(2)} className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 font-bold">中</button>
          <button type="button" onClick={() => setHeading(3)} className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 font-bold">小</button>
          <button type="button" onClick={setParagraph} className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100">標準</button>

          <div className="w-px h-5 bg-gray-300 mx-2"></div>

          <span className="text-xs text-gray-500 font-bold ml-1">装飾:</span>
          <button type="button" onClick={() => toggleStyle('bold')} className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 font-bold">B</button>
          <button type="button" onClick={() => toggleStyle('italic')} className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 italic">I</button>
          <button type="button" onClick={() => toggleStyle('underline')} className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 underline">U</button>
          <button type="button" onClick={() => toggleStyle('strike')} className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 line-through">S</button>
        </div>

        <div className="flex-grow py-4">
          <BlockNoteView 
            editor={editor} 
            onChange={() => {
              const jsonString = JSON.stringify(editor.document)
              setContent(jsonString)
            }}
            theme="light"
          >
            <SuggestionMenuController
              triggerCharacter={"["}
              getItems={async (query) => {
                const filteredPages = pages.filter((page) => 
                  page.title.toLowerCase().includes(query.toLowerCase())
                )
                
                return filteredPages.map((page) => ({
                  title: page.title,
                  subtext: `/page/${page.slug}`,
                  onItemClick: () => {
                    // ★ 修正箇所: textにhrefをつけるのではなく、専用のlinkタイプとして挿入します
                    editor.insertInlineContent([
                      {
                        type: "link",
                        href: `/page/${page.slug}`,
                        content: page.title
                      }
                    ])
                  }
                }))
              }}
            />
          </BlockNoteView>
        </div>
      </div>
    </div>
  )
}