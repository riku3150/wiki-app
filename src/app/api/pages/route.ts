import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // リンクの候補として使いやすいように、必要な情報だけを取得します
    const pages = await prisma.wikiPage.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
      },
      orderBy: {
        updatedAt: 'desc', // 最近編集したページが上に来るように並び替えます
      },
    })
    
    return NextResponse.json(pages)
  } catch (error) {
    console.error('ページの取得に失敗しました:', error)
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 })
  }
}