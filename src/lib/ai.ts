import { prisma } from '@/lib/prisma'

/**
 * 記事のテキストをAI用のベクトルデータに変換し、データベースに保存する関数
 */
export async function generateAndSaveEmbedding(pageId: string, content: string) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('GEMINI_API_KEYが設定されていません')
    return
  }

  try {
    // 確実な解決策: ライブラリを使わず、標準機能(fetch)で最新モデル(gemini-embedding-2)を直接呼び出します
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: {
            parts: [{ text: content }],
          },
          // データベース側の768個の箱にぴったり収まるように指定します
          outputDimensionality: 768,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API呼び出しエラー: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    // もし正しくデータが取れなかった時のための安全対策
    if (!data.embedding || !data.embedding.values) {
      throw new Error('Geminiから予期しないデータが返ってきました')
    }

    const embedding = data.embedding.values

    // データベース（pgvector）に保存できる形式に変換
    const embeddingString = `[${embedding.join(',')}]`

    // 古いデータが残っているとおかしくなるので、同じページIDのデータがあれば一度削除（更新時のため）
    await prisma.$executeRaw`DELETE FROM wiki_embeddings WHERE page_id = ${pageId}`

    // 新しいベクトルデータを挿入
    await prisma.$executeRaw`
      INSERT INTO wiki_embeddings (page_id, content, embedding)
      VALUES (${pageId}, ${content}, ${embeddingString}::vector)
    `
    
    console.log(`ページID: ${pageId} のAIデータを保存しました！（最新モデル gemini-embedding-2 を使用）`)
  } catch (error) {
    console.error('AIデータの保存に失敗しました:', error)
  }
}