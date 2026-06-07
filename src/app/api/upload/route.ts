import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    // 送信されたデータからファイルを取り出します
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません。' },
        { status: 400 }
      )
    }

    // 同じ名前の画像が上書きされないように、現在時刻とランダムな文字で専用のファイル名を作ります
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    // Supabaseの storage（wiki-imagesバケット）にファイルをアップロードします
    const { data, error } = await supabase.storage
      .from('wiki-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('アップロードエラー:', error)
      return NextResponse.json(
        { error: '画像のアップロードに失敗しました。' },
        { status: 500 }
      )
    }

    // アップロードされた画像の公開用URL（誰でも見れるURL）を取得します
    const { data: { publicUrl } } = supabase.storage
      .from('wiki-images')
      .getPublicUrl(fileName)

    // BlockNoteエディタが認識できるように、取得したURLを返却します
    return NextResponse.json({ url: publicUrl })

  } catch (error) {
    console.error('サーバーエラー:', error)
    return NextResponse.json(
      { error: 'サーバーで予期せぬエラーが発生しました。' },
      { status: 500 }
    )
  }
}