'use client'

import { useEffect, useState } from 'react'
import { BlockNoteEditor, PartialBlock } from '@blocknote/core'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'

export default function BlockNoteRenderer({ body }: { body?: string | null }) {
  const [editor, setEditor] = useState<BlockNoteEditor | null>(null)

  useEffect(() => {
    async function initRenderer() {
      let initialBlocks: PartialBlock[] | undefined = undefined

      // trimを一切使わず、文字が存在する場合だけ処理する最強の安全策
      if (typeof body === 'string' && body.length > 0) {
        try {
          // JSONとして解析を試みる
          initialBlocks = JSON.parse(body)
        } catch (e) {
          // 失敗したらHTMLとして解析を試みる
          try {
            const tempEditor = BlockNoteEditor.create()
            initialBlocks = await tempEditor.tryParseHTMLToBlocks(body)
          } catch (htmlError) {
            console.error('HTML解析も失敗しました', htmlError)
          }
        }
      }

      const newEditor = BlockNoteEditor.create({
        initialContent: initialBlocks,
      })
      setEditor(newEditor)
    }

    initRenderer()
  }, [body])

  if (!editor) return <div className="animate-pulse bg-gray-100 h-40 rounded-md" />

  return (
    <div className="-mx-[54px]"> 
      <BlockNoteView 
        editor={editor} 
        editable={false} 
        theme="light" 
      />
    </div>
  )
}