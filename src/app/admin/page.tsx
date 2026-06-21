'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

// ユーザー情報の型を定義（データベースの変更に合わせて追加しました！）
type UserData = {
  id: string
  email: string
  role: string
  raw_user_meta_data: any // プロフィール画像や名前が入る箱を追加
}

export default function AdminPage() {
  const supabase = createClient()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // データベースからユーザー一覧を取得する関数
  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    
    // 先ほどSQLで作成した「get_users_with_roles」関数を呼び出す
    const { data, error } = await supabase.rpc('get_users_with_roles')
    
    if (error) {
      setError('ユーザー情報の取得に失敗しました。管理者権限がない可能性があります。')
      console.error(error)
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }

  // 画面が表示された時に一回だけユーザー一覧を取得する
  useEffect(() => {
    fetchUsers()
  }, [])

  // 権限のプルダウンが変更された時の処理
  const handleRoleChange = async (userId: string, newRole: string) => {
    const isConfirmed = confirm('このユーザーの権限を変更しますか？')
    if (!isConfirmed) return

    // 先ほどSQLで作成した「update_user_role」関数を呼び出す
    const { error } = await supabase.rpc('update_user_role', {
      target_user_id: userId,
      new_role: newRole,
    })

    if (error) {
      alert('権限の更新に失敗しました: ' + error.message)
    } else {
      alert('権限を更新しました！')
      fetchUsers() // 画面のリストを最新状態に更新する
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-600">読み込み中...</div>
  if (error) return <div className="p-8 text-center text-red-600 font-bold">{error}</div>

  return (
    <main className="max-w-4xl mx-auto p-6 mt-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">ユーザー権限管理ダッシュボード 🛡️</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-700">ユーザー情報</th>
              <th className="p-4 font-semibold text-gray-700">現在の権限</th>
              <th className="p-4 font-semibold text-gray-700">権限の変更</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              // 取得したデータからアイコンURLと名前を安全に取り出します
              const metaData = u.raw_user_meta_data || {}
              const avatarUrl = metaData.avatar_url
              const userName = metaData.full_name || metaData.name || u.email || '名無し'

              return (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    {/* アイコン、名前、メールアドレスを綺麗に並べるUIに変更しました！ */}
                    <div className="flex items-center gap-3">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="User Avatar" className="w-10 h-10 rounded-full border border-gray-200 object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-gray-800 font-semibold">{userName}</span>
                        <span className="text-xs text-gray-500">{u.email || '非公開'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {/* 権限ごとにバッジの色を変えて分かりやすくする */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      u.role === 'creator' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'admin' ? 'bg-red-100 text-red-800' :
                      u.role === 'editor' ? 'bg-green-100 text-green-800' :
                      u.role === 'viewer' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      className="border border-gray-300 rounded-md p-2 text-sm text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={u.role === 'creator'} // 作成者自身の権限は間違えて変えないようにロック
                    >
                      <option value="pending">pending (承認待ち)</option>
                      <option value="viewer">viewer (閲覧のみ)</option>
                      <option value="editor">editor (編集者)</option>
                      <option value="admin">admin (管理者)</option>
                      {u.role === 'creator' && <option value="creator">creator (作成者)</option>}
                    </select>
                  </td>
                </tr>
              )
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">ユーザーがいません</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}