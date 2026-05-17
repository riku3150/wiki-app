export default function SearchBar() {
  return (
    // action="/" とすることで、送信時にトップページ (/?q=キーワード) へ遷移します
    <form action="/" method="GET" className="mb-6 flex gap-2">
      <input
        type="text"
        name="q" // URLのパラメータ名になります（例: ?q=Unity）
        placeholder="タイトルやタグで検索 (例: Unity, シェーダー)..."
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-transparent text-slate-800"
      />
      <button
        type="submit"
        className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-6 py-2 rounded-md transition whitespace-nowrap font-medium"
      >
        検索
      </button>
    </form>
  )
}