'use client'

import { useFormStatus } from 'react-dom'

export default function SubmitButton() {
  // useFormStatusを使って、親にあるformが現在送信中（pending）かどうかを自動で取得します
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md transition font-bold flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          {/* 送信中の場合は、ボタンの中に小さなくるくるアニメーションを表示します */}
          <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
          <span>保存中...</span>
        </>
      ) : (
        '更新を保存'
      )}
    </button>
  )
}