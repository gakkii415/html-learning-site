import type { Metadata } from 'next';
import { IBM_Plex_Mono, M_PLUS_Rounded_1c, Noto_Sans_JP } from 'next/font/google';
import './globals.css';

const bodyFont = Noto_Sans_JP({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const displayFont = M_PLUS_Rounded_1c({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['700', '800'],
});

const codeFont = IBM_Plex_Mono({
  variable: '--font-code',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'タグの練習帳｜書いて覚えるHTML入門',
  description: 'コードを書き、すぐに結果を見ながらHTMLの基本タグを学べる日本語の初心者向け学習サイトです。',
  openGraph: {
    title: 'タグの練習帳｜書いて覚えるHTML入門',
    description: '6つの短いレッスンで、最初のHTMLページを完成させよう。',
    type: 'website',
    locale: 'ja_JP',
    images: [{ url: 'https://raw.githubusercontent.com/gakkii415/html-learning-site/main/public/og.png', width: 1200, height: 630, alt: 'タグの練習帳｜書いて覚えるHTML入門' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'タグの練習帳｜書いて覚えるHTML入門',
    description: '6つの短いレッスンで、最初のHTMLページを完成させよう。',
    images: ['https://raw.githubusercontent.com/gakkii415/html-learning-site/main/public/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className={`${bodyFont.variable} ${displayFont.variable} ${codeFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
