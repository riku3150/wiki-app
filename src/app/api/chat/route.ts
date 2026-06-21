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
    // 3. 複数のモデルを自動で切り替えて回答を生成する（フォールバック機能）
    // --------------------------------------------------------
    const prompt = `あなたは社内（プライベート）Wikiアプリの優秀なAIアシスタントです。
以下の「Wikiの参考情報」を元に、ユーザーの「質問」に丁寧に答えてください。
もし参考情報の中に答えや関連情報がない場合は、知ったかぶりをせず「現在のWikiにはその情報が記載されていないようです」と正直に答えてください。

【Wikiの参考情報】
${contextText}

【ユーザーの質問】
${message}
`

    // 💡修正ポイント：優先的に試すモデルのリスト（上から順に実行します）
    const modelsToTry = [
      'gemini-1.5-pro-latest',   // 本命：高機能で無料枠も安定しているモデル
      'gemini-1.5-flash-latest', // 代替1：高速なモデル
      'gemini-pro'               // 最終手段：古いが絶対に動く基礎モデル
    ]

    let answer = ''
    let lastError = ''

    // リストのモデルを上から順番に試していくループ
    for (const modelName of modelsToTry) {
      try {
        console.log(`モデル ${modelName} を試行中...`)
        
        const generateResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        )

        // APIからの返答がエラーだった場合は、このループ内の処理を中断してcatchへ飛ぶ
        if (!generateResponse.ok) {
          const errorText = await generateResponse.text()
          throw new Error(`HTTPエラー: ${generateResponse.status} - ${errorText}`)
        }

        const generateData = await generateResponse.json()
        
        if (!generateData.candidates || generateData.candidates.length === 0) {
          throw new Error('回答が空っぽでした')
        }

        // 無事に回答が取得できたら、変数に保存してループを強制終了（成功！）
        answer = generateData.candidates[0].content.parts[0].text
        console.log(`✨ モデル ${modelName} で回答の生成に成功しました！`)
        break 

      } catch (error: any) {
        // エラーが出てもアプリは落とさず、警告だけ残して次のモデルを試す
        console.warn(`⚠️ モデル ${modelName} は失敗しました:`, error.message)
        lastError = error.message
      }
    }

    // 全てのモデルを試してもダメだった場合のみ、最終的なエラーを画面に返す
    if (!answer) {
      throw new Error(`すべてのAIモデルが利用できませんでした。最後のエラー: ${lastError}`)
    }

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