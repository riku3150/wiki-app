import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import fs from 'fs'

export async function POST(request: NextRequest) {
  try {
    // フォームデータから送られてきたファイルを取得します
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 400 })
    }

    // ファイルをバイナリデータ（Buffer）に変換します
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 保存先のディレクトリ（public/uploads）のパスを設定します
    const uploadDir = path.join(process.cwd(), 'public/uploads')
    
    // フォルダが存在しない場合は自動的に作成します
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // ファイル名が被らないように、現在時刻とランダムな数字を組み合わせた名前にします
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_') // 日本語ファイル名などの文字化け対策
    const filename = `${uniqueSuffix}-${originalName}`
    const filepath = path.join(uploadDir, filename)

    // ファイルを書き込み（保存）します
    await writeFile(filepath, buffer)

    // 保存した画像にアクセスするためのURLパスを返します
    const fileUrl = `/uploads/${filename}`
    
    return NextResponse.json({ url: fileUrl })
  } catch (error) {
    console.error('画像アップロードエラー:', error)
    return NextResponse.json({ error: 'アップロードに失敗しました' }, { status: 500 })
  }
}