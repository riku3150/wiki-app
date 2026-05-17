import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
// 先ほど作成したリッチテキストエディタをインポートします
import RichTextEditor from '@/components/RichTextEditor'

export default async function NewPage() {
  const allPages = await prisma.wikiPage.findMany({
    select: { id: true, title: true },
    orderBy: { title: 'asc' },
  })

  async function createPage(formData: FormData) {
    'use server'

    const title = formData.get('title') as string
    const body = formData.get('body') as string // エディタからHTML形式で届きます
    const parentId = formData.get('parentId') as string
    const tags = formData.get('tags') as string || ''
    
    const slug = encodeURIComponent(title.toLowerCase().replace(/ /g, '-'))

    await prisma.wikiPage.create({
      data: {
        title,
        body,
        slug,
        tags,
        updatedBy: 'Riku',
        parentId: parentId !== '' ? parentId : null,
      },
    })

    redirect('/')
  }

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:underline">
          ← トップへ戻る
        </Link>
        <h1 className="text-3xl font-bold mt-4">新規ページ作成</h1>
      </div>

      <form action={createPage} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              タイトル
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full p-2 border border-gray-300 rounded-md bg-transparent"
              placeholder="例: Unityの最適化について"
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
              className="w-full p-2 border border-gray-300 rounded-md bg-transparent"
              placeholder="例: Unity, C#"
            />
          </div>
        </div>

        <div>
          <label htmlFor="parentId" className="block text-sm font-medium mb-2">
            親ページ（オプション）
          </label>
          <select
            id="parentId"
            name="parentId"
            className="w-full p-2 border border-gray-300 rounded-md bg-transparent"
          >
            <option value="">なし（最上位ページにする）</option>
            {allPages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium mb-2">
            内容
          </label>
          {/* MarkdownEditorからRichTextEditorに置き換えました。
            これでWordのような「見たまま」の編集が可能になります。
          */}
          <RichTextEditor />
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md transition font-bold"
          >
            Wikiを保存する
          </button>
        </div>
      </form>
    </main>
  )
}