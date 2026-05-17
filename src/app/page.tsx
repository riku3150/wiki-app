import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import TreeItem from '@/components/TreeItem'
import SearchBar from '@/components/SearchBar' // 作成した検索バーをインポート

type PageNode = {
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  children: PageNode[];
}

export default async function Home({
  searchParams,
}: {
  // Next.jsの機能で、URLのパラメータ（?q=xxx）を受け取ります
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  // 検索キーワードを取得（ない場合は空文字）
  const searchQuery = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : ''

  // 検索ワードがある場合は「タイトル」か「タグ」に部分一致するものを探し、ない場合は全件取得します
  const allPages = await prisma.wikiPage.findMany({
    where: searchQuery ? {
      OR: [
        // mode: 'insensitive' をつけると、大文字・小文字を区別せずに検索してくれます（例: unity と Unity）
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { tags: { contains: searchQuery, mode: 'insensitive' } },
      ],
    } : undefined,
    orderBy: { title: 'asc' },
  })

  // 検索キーワードが入力されているかどうかの判定フラグです
  const isSearchMode = searchQuery.length > 0;

  // ツリー構造の構築（通常モードの時だけ行います）
  const pageMap = new Map<string, PageNode>()
  const rootPages: PageNode[] = []

  if (!isSearchMode) {
    allPages.forEach((page) => {
      pageMap.set(page.id, { 
        id: page.id, 
        title: page.title, 
        slug: page.slug, 
        parentId: page.parentId, 
        children: [] 
      })
    })

    allPages.forEach((page) => {
      const node = pageMap.get(page.id)!
      if (page.parentId) {
        const parent = pageMap.get(page.parentId)
        if (parent) {
          parent.children.push(node)
        } else {
          rootPages.push(node) 
        }
      } else {
        rootPages.push(node)
      }
    })
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b border-gray-300 pb-4">
        <h1 className="text-4xl font-bold text-slate-800">Game Development Wiki</h1>
        <Link 
          href="/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
        >
          新規ページ作成
        </Link>
      </div>

      {/* 検索バーを画面上部に配置します */}
      <SearchBar />

      <div className="bg-white p-6 border border-gray-300 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2 text-gray-700">
          {/* 状態によって見出しのテキストを切り替えます */}
          {isSearchMode ? `「${searchQuery}」の検索結果` : 'ページ一覧'}
        </h2>
        
        {allPages.length === 0 ? (
          <p className="text-gray-500 text-sm">
            {isSearchMode ? '一致するページが見つかりませんでした。' : 'まだページがありません。最初のページを作成しましょう！'}
          </p>
        ) : (
          <div className="space-y-1">
            {isSearchMode ? (
              // 【検索モード】フラットなリストとして表示し、設定されたタグも画面に出します
              <ul className="space-y-3">
                {allPages.map((page) => (
                  <li key={page.id} className="border-b border-gray-100 pb-2 last:border-0">
                    <Link href={`/page/${page.slug}`} className="text-lg font-medium text-blue-600 hover:underline">
                      {page.title}
                    </Link>
                    {/* タグが設定されている場合は、見やすくバッジのように表示します */}
                    {page.tags && (
                      <div className="mt-1 text-sm text-gray-500">
                        {page.tags.split(',').map(t => t.trim()).filter(t => t).map((tag, index) => (
                          <span key={index} className="inline-block bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs mr-2 font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              // 【通常モード】これまで通りのツリー構造で表示します
              rootPages.map((page) => (
                <TreeItem key={page.id} page={page} />
              ))
            )}
          </div>
        )}
      </div>

      {/* 検索している時は、元のツリー画面に戻るためのリンクを出しておきます */}
      {isSearchMode && (
        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:underline font-medium">
            ページ一覧に戻る
          </Link>
        </div>
      )}
    </main>
  )
}