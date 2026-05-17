'use client'

import { useRef, useState } from 'react'

export default function MarkdownEditor({ defaultValue = '' }: { defaultValue?: string }) {
  // テキストエリアを直接操作するための参照（Ref）を用意します
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // 画像のアップロード中かどうかを管理する状態です
  const [isUploading, setIsUploading] = useState(false)

  // ファイルが選択されたときに実行される関数です
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    // 送信用のデータを作成します
    const formData = new FormData()
    formData.append('file', file)

    try {
      // 先ほど作成した画像保存用APIにデータを送信します
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.url) {
        // APIから返ってきたURLを使って、Markdownの画像リンク構文を作ります
        const imageMarkdown = `\n![${file.name}](${data.url})\n`
        const textarea = textareaRef.current

        if (textarea) {
          // 現在のカーソル位置を取得します
          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const text = textarea.value

          // カーソルの位置に画像リンクを挿入します
          textarea.value = text.substring(0, start) + imageMarkdown + text.substring(end)
          
          // カーソル位置を挿入したテキストの後ろに移動させます
          textarea.selectionStart = textarea.selectionEnd = start + imageMarkdown.length
          // テキストエリアにフォーカスを戻します
          textarea.focus()
        }
      } else {
        alert(data.error || '画像のアップロードに失敗しました')
      }
    } catch (error) {
      console.error('アップロードエラー:', error)
      alert('アップロード中にエラーが発生しました')
    } finally {
      setIsUploading(false)
      // 同じ画像を連続で選べるように、入力欄をリセットします
      e.target.value = ''
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center">
        {/* 画像アップロード用のボタン（実態はファイル選択用のラベル） */}
        <label className={`cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm py-1.5 px-3 rounded-md flex items-center gap-2 transition ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {isUploading ? '⏳ アップロード中...' : '📷 画像を挿入'}
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleImageUpload} 
            disabled={isUploading} 
          />
        </label>
      </div>
      
      {/* 実際のテキスト入力欄 */}
      <textarea
        ref={textareaRef}
        id="body"
        name="body"
        required
        rows={15}
        defaultValue={defaultValue}
        className="w-full p-2 border border-gray-300 rounded-md bg-transparent font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="ここに内容を入力してください...（Markdown形式）"
      ></textarea>
    </div>
  )
}