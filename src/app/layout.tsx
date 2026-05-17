import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wiki App",
  description: "Game Dev Wiki",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // ★ここに suppressHydrationWarning を追加することで、
    // 拡張機能によるHTMLの書き換えエラーを無視するようになります！
    <html lang="ja" suppressHydrationWarning>
      <body
        // bg-white を bg-orange-50 (ほんのりオレンジ) に変更し、
        // text-gray-900 を text-slate-800 (少し柔らかい黒) に変更しました
        className={`${inter.className} bg-orange-50 text-slate-800`}
      >
        {children}
      </body>
    </html>
  );
}