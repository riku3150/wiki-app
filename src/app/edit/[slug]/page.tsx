import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
// 新しいリッチテキストエディタをインポート
import RichTextEditor from '@/components/RichTextEditor'

export default async function EditPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params

  // 編集対象のデータを取得
  const page = await prisma.wikiPage.findUnique({
    where: { slug: slug },
  })

  if (!page) {
    notFound()
  }

  // 更新処理（Server Action）
  async function updatePage(formData: FormData) {
    'use server'

    const title = formData.get('title') as string
    const body = formData.get('body') as string // リッチテキストのHTMLを受け取ります
    const tags = formData.get('tags') as string || ''

    await prisma.wikiPage.update({
      where: { id: page!.id }, 
      data: {
        title,
        body,
        tags, 
        updatedBy: 'Riku',
      },
    })

    redirect(`/page/${page!.slug}`)
  }

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <Link href={`/page/${slug}`} className="text-blue-600 hover:underline">
          ← キャンセルして戻る
        </Link>
        <h1 className="text-3xl font-bold mt-4">ページの編集</h1>
      </div>

      <form action={updatePage} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              タイトル
            </label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={page.title} 
              required
              className="w-full p-2 border border-gray-300 rounded-md bg-transparent"
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-2">
              タグ（カンマ区切り）
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              defaultValue={page.tags} 
              className="w-full p-2 border border-gray-300 rounded-md bg-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium mb-2">
            内容
          </label>
          {/* ここを defaultValue から initialContent に修正しました！
              これでエディタに正しく過去のデータが渡ります。
          */}
          <RichTextEditor initialContent={page.body} />
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md transition font-bold"
          >
            更新を保存
          </button>
        </div>
      </form>
    </main>
  )
}