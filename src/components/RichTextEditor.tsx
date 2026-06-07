'use client'

import { useState, useEffect } from 'react'
import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'
// エラーの原因だった古いインポートを、以下の正しいパスに修正しました
import * as locales from '@blocknote/core/locales'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'

export default function RichTextEditor({ initialContent }: { initialContent?: string | null }) {
  // DBに保存するためのデータを管理します
  const [content, setContent] = useState<string>(initialContent || '')

  // 工程2-3で作ったAPIを使って、画像をSupabaseにアップロードする関数です
  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('画像のアップロードに失敗しました')
      }

      const data = await response.json()
      // 成功したら、Supabaseの画像URLをBlockNoteエディタに返して表示させます
      return data.url
    } catch (error) {
      console.error('画像エラー:', error)
      alert('画像のアップロードに失敗しました。')
      return ''
    }
  }

  // エディタの初期化
  const editor = useCreateBlockNote({
    // ここで日本語辞書を適用し、メニューを日本語に戻します
    dictionary: locales.ja,
    uploadFile,
  })

  // 編集画面（既存のデータがある場合）の読み込み処理
  useEffect(() => {
    if (initialContent) {
      async function loadContent() {
        try {
          const blocks = JSON.parse(initialContent as string)
          editor.replaceBlocks(editor.document, blocks)
        } catch (e) {
          const blocks = await editor.tryParseHTMLToBlocks(initialContent as string)
          editor.replaceBlocks(editor.document, blocks)
        }
      }
      loadContent()
    }
  }, [editor, initialContent])

  return (
    <div className="border border-gray-300 rounded-md bg-white min-h-[400px] py-4">
      {/* この隠しinputが、フォーム送信時に「name="body"」としてデータを送る役割を果たします */}
      <input type="hidden" name="body" value={content} />
      
      <BlockNoteView
        editor={editor}
        theme="light"
        onChange={() => {
          // エディタの内容が変わるたびに、最新の状態をJSONとして記録します
          setContent(JSON.stringify(editor.document))
        }}
      />
    </div>
  )
}