'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

// メッセージの型を定義
type Message = {
  role: 'user' | 'ai'
  text: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // チャットが追加された時に自動で一番下までスクロールするための参照
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // メッセージが増えるたびに自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // メッセージを送信する処理
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userText = input.trim()
    
    // まずユーザーのメッセージを画面に追加
    setMessages((prev) => [...prev, { role: 'user', text: userText }])
    setInput('')
    setIsLoading(true)

    try {
      // すでに完成しているAIの頭脳（API）をそのまま呼び出します！
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      })
      
      const data = await res.json()

      if (res.ok) {
        // AIからの回答を画面に追加
        setMessages((prev) => [...prev, { role: 'ai', text: data.answer }])
      } else {
        // エラー時のメッセージ
        setMessages((prev) => [...prev, { role: 'ai', text: `エラー: ${data.error}` }])
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'ai', text: '通信エラーが発生しました。時間を置いて再度お試しください。' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="p-4 md:p-8 max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      <div className="mb-4">
        <Link href="/" className="text-blue-600 hover:underline">
          ← トップへ戻る
        </Link>
        <h1 className="text-3xl font-bold mt-4 flex items-center gap-2">
          <span>🤖</span> Wiki専用AIチャット
        </h1>
        <p className="text-gray-600 mt-2">
          Wikiの内容について、AIに何でも質問してください。広い画面でじっくり対話できます。
        </p>
      </div>

      {/* チャットエリア（画面の高さいっぱいに広がるように設定） */}
      <div className="flex-1 bg-white rounded-2xl shadow-md border border-gray-200 flex flex-col overflow-hidden mb-4">
        
        {/* メッセージ表示エリア */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50 flex flex-col gap-6">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 my-auto">
              <span className="text-4xl mb-4 block">💬</span>
              <p className="text-lg">こんにちは！</p>
              <p>下の入力欄からWikiについて質問してみましょう。</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
              >
                <span className="text-sm text-gray-500 mb-1 px-1">
                  {msg.role === 'user' ? 'あなた' : 'AIアシスタント'}
                </span>
                <div 
                  className={`px-5 py-3 rounded-2xl text-base leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}
          {/* ローディング（AIが考え中）の表示 */}
          {isLoading && (
            <div className="self-start flex flex-col max-w-[85%]">
              <span className="text-sm text-gray-500 mb-1 px-1">AIアシスタント</span>
              <div className="bg-white border border-gray-200 px-5 py-4 rounded-2xl rounded-bl-none shadow-sm flex gap-2 items-center">
                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          {/* スクロール用の空要素 */}
          <div ref={messagesEndRef} />
        </div>

        {/* 入力フォーム */}
        <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Wikiについて質問を入力..."
            className="flex-1 px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base bg-gray-50 transition"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center font-bold"
          >
            送信
          </button>
        </form>
      </div>
    </main>
  )
}