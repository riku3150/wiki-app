'use client' // ← これが「ブラウザ側（クライアント）で動かしてね」という合図です

import { useTransition } from 'react'

// props（引数）として、親から「削除を実行する関数」を受け取ります
export default function DeleteButton({ 
  deleteAction 
}: { 
  deleteAction: () => Promise<void> 
}) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    // ここでブラウザの確認ダイアログを出します
    if (confirm('本当にこのページを削除しますか？この操作は取り消せません。')) {
      // ユーザーが「OK」を押した場合のみ、親から受け取った削除関数を実行します
      startTransition(async () => {
        await deleteAction()
      })
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className={`text-sm px-3 py-1 rounded transition ${
        isPending 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
          : 'bg-red-100 hover:bg-red-200 text-red-600'
      }`}
    >
      {isPending ? '削除中...' : '削除'}
    </button>
  )
}