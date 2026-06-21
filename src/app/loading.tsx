export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      {/* Tailwind CSSの機能を使って、青いくるくる回る円形のアニメーションを作成します。
        animate-spin: 回転アニメーション
        border-t-transparent: 上部の線を透明にして、欠けた円（スピナー）を表現します
      */}
      <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    </div>
  )
}