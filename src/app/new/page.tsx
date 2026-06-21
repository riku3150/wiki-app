import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import RichTextEditor from '@/components/RichTextEditor'
import { generateAndSaveEmbedding } from '@/lib/ai'
import SubmitButton from '@/components/SubmitButton'

export const dynamic = 'force-dynamic'

export default async function NewPage({
  searchParams,
}: {
  // Next.js 15以降の仕様に合わせて、searchParamsをPromiseとして受け取ります
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // URLのパラメータ（?parentId=...）を取得して、初期値として設定します
  const resolvedSearchParams = await searchParams
  const defaultParentId = typeof resolvedSearchParams.parentId === 'string' ? resolvedSearchParams.parentId : ''

  const allPages = await prisma.wikiPage.findMany({
    select: { id: true, title: true },
    orderBy: { title: 'asc' },
  })

  async function createPage(formData: FormData) {
    'use server'

    const title = formData.get('title') as string
    const body = formData.get('body') as string 
    const parentId = formData.get('parentId') as string
    const tags = formData.get('tags') as string || ''
    
    const slug = encodeURIComponent(title.toLowerCase().replace(/ /g, '-'))

    const newPage = await prisma.wikiPage.create({
      data: {
        title,
        body,
        slug,
        tags,
        updatedBy: 'Riku',
        parentId: parentId !== '' ? parentId : null,
      },
    })

    const aiContent = `タイトル: ${title}\n内容: ${body}`
    await generateAndSaveEmbedding(newPage.id, aiContent)

    revalidatePath('/')
    revalidatePath('/new')

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
            defaultValue={defaultParentId}
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
          <RichTextEditor />
        </div>

        <div className="flex justify-end pt-4 border-t">
          <SubmitButton />
        </div>
      </form>
    </main>
  )
}