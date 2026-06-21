import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    // フロントエンド（画面）から送られてきた質問メッセージを受け取る
    const { message } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'APIキーが設定されていません' }, { status: 500 })
    }

    // --------------------------------------------------------
    // 1. ユーザーの質問をAI用のベクトル（数字の列）に変換する
    // --------------------------------------------------------
    const embedResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { parts: [{ text: message }] },
          outputDimensionality: 768,
        }),
      }
    )

    if (!embedResponse.ok) {
      const errText = await embedResponse.text()
      throw new Error(`ベクトル変換エラー: ${embedResponse.status} - ${errText}`)
    }

    const embedData = await embedResponse.json()
    const embedding = embedData.embedding.values
    const embeddingString = `[${embedding.join(',')}]`

    // --------------------------------------------------------
    // 2. データベース（pgvector）から、質問に似ているWiki記事を探す
    // --------------------------------------------------------
    const matches: any[] = await prisma.$queryRaw`
      SELECT * FROM match_wiki_pages(${embeddingString}::vector, 0.3, 3)
    `

    // 見つかった記事のテキストを1つの長い文字列にまとめる
    let contextText = ''
    if (matches && matches.length > 0) {
      contextText = matches.map((match) => match.content).join('\n\n---\n\n')
    } else {
      contextText = '関連するWiki記事は見つかりませんでした。'
    }

    // --------------------------------------------------------
    // 3. Geminiの文章作成モデルに情報を渡して回答をもらう
    // --------------------------------------------------------
    const prompt = `あなたは社内（プライベート）Wikiアプリの優秀なAIアシスタントです。
以下の「Wikiの参考情報」を元に、ユーザーの「質問」に丁寧に答えてください。
もし参考情報の中に答えや関連情報がない場合は、知ったかぶりをせず「現在のWikiにはその情報が記載されていないようです」と正直に答えてください。

【Wikiの参考情報】
${contextText}

【ユーザーの質問】
${message}
`

    // 💡修正ポイント：モデル名を最新の「gemini-2.0-flash」に変更しました
    const generateResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    )

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text()
      console.error('Gemini Generation Error:', errorText)
      throw new Error(`AI回答エラー: ${generateResponse.status} - ${errorText}`)
    }

    const generateData = await generateResponse.json()
    
    // 安全対策: AIからの回答が空っぽだった場合の処理
    if (!generateData.candidates || generateData.candidates.length === 0) {
      throw new Error('AIが回答を生成できませんでした（ポリシー制限などの可能性があります）')
    }

    const answer = generateData.candidates[0].content.parts[0].text

    // 作成された回答をフロントエンド（画面）に返す
    return NextResponse.json({ answer })

  } catch (error: any) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: error.message || 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}