'use client'

import { useState, useRef, useEffect } from 'react'

// メッセージの型を定義
type Message = {
  role: 'user' | 'ai'
  text: string
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
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
      // 工程1で作ったAIの頭脳（API）に質問を投げる
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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* チャットウィンドウ（isOpenがtrueの時だけ表示） */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 sm:w-96 h-[500px] flex flex-col mb-4 overflow-hidden animate-fade-in-up">
          {/* ヘッダー */}
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <h3 className="font-bold tracking-wide">Wiki AI アシスタント</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-blue-200 transition focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* メッセージ表示エリア */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 my-auto text-sm">
                <p>こんにちは！</p>
                <p>Wikiの内容について何でも聞いてください。</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
                >
                  <span className="text-xs text-gray-500 mb-1 px-1">
                    {msg.role === 'user' ? 'あなた' : 'AIアシスタント'}
                  </span>
                  <div 
                    className={`px-4 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
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
                <span className="text-xs text-gray-500 mb-1 px-1">AIアシスタント</span>
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            {/* スクロール用の空要素 */}
            <div ref={messagesEndRef} />
          </div>

          {/* 入力フォーム */}
          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Wikiについて質問..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm bg-gray-50"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center w-10 h-10"
            >
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* 画面右下に常に表示される丸いチャットボタン（isOpenがfalseの時だけ表示） */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-xl transition transform hover:scale-105 flex items-center justify-center"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}
    </div>
  )
}