import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted (SIL OFL) so the app does not depend on Google Fonts at build or run time.
const vazirmatn = localFont({
  src: "./fonts/Vazirmatn-Variable.woff2",
  variable: "--font-vazirmatn",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "پالس | تحلیل پژوهشی رادیوگرافی",
    template: "%s | پالس",
  },
  description: "رابط پژوهشی برای دریافت پیش‌بینی مدل PneumoniaCNN از تصویر رادیوگرافی قفسه سینه، همراه با ارائه‌ی «کاربرد هوش مصنوعی در پزشکی».",
};

export const viewport: Viewport = {
  themeColor: "#0f2a2e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
