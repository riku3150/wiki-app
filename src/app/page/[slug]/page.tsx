import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import DeleteButton from '@/components/DeleteButton'
import BlockNoteRenderer from '@/components/BlockNoteRenderer'

export default async function ViewPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
 }) {
  const { slug } = await params

  const page = await prisma.wikiPage.findUnique({
    where: { slug: slug },
    include: {
      parent: true,
      children: true,
    }
  })

  if (!page) {
    notFound()
  }

  async function deletePage() {
    'use server'

    await prisma.wikiPage.delete({
      where: { id: page!.id },
    })

    redirect('/')
  }

  return (
    /* 修正ポイント: p-8 から p-4 md:p-8 に変更し、スマホでは余白を狭くします */
    <main className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* 修正ポイント: flex-col sm:flex-row を指定し、スマホでは縦並び、一定以上の画面幅で横並びにします */}
      <nav className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <Link href="/" className="text-blue-600 hover:underline text-sm md:text-base">
            ← トップへ戻る
          </Link>
          
          {page.parent && (
            <span className="text-sm text-gray-500">
              親ページ: <Link href={`/page/${page.parent.slug}`} className="text-blue-600 hover:underline">{page.parent.title}</Link>
            </span>
          )}
        </div>

        {/* 修正ポイント: スマホではボタンを押しやすいよう横いっぱいに広げられるようにします */}
        <div className="flex gap-4 w-full sm:w-auto justify-end">
          <Link 
            href={`/edit/${slug}`} 
            className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 sm:px-3 sm:py-1 rounded transition text-center flex-1 sm:flex-none font-medium"
          >
            編集
          </Link>
          <DeleteButton deleteAction={deletePage} />
        </div>
      </nav>

      <article>
        <header className="mb-8 border-b border-gray-300 pb-4">
          {/* 修正ポイント: text-4xl から text-2xl md:text-4xl にし、長いタイトルも break-words で自動折り返しさせます */}
          <h1 className="text-2xl md:text-4xl font-bold mb-3 text-slate-800 break-words">{page.title}</h1>
          
          {/* タグを安全に表示するための処理 */}
          {page.tags && typeof page.tags === 'string' && (
            <div className="mb-4 flex flex-wrap gap-2">
              {page.tags.split(',').filter(t => t).map((tag, index) => (
                <span key={index} className="inline-block bg-orange-100 text-orange-800 px-2.5 py-1 rounded-md text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 修正ポイント: スマホで文字が重ならないよう flex-wrap を追加します */}
          <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
            <span>更新者: {page.updatedBy}</span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span>最終更新: {page.updatedAt.toLocaleString('ja-JP')}</span>
          </div>
        </header>

        <div className="min-h-[200px]">
          <BlockNoteRenderer body={page.body} />
        </div>
      </article>

      {page.children.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-300">
          <h2 className="text-2xl font-bold mb-4 text-slate-700">子ページ一覧</h2>
          <ul className="list-disc list-inside space-y-2">
            {page.children.map((child) => (
              <li key={child.id}>
                <Link href={`/page/${child.slug}`} className="text-blue-600 hover:underline">
                  {child.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}