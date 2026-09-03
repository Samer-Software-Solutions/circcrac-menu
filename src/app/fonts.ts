import { Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["arabic"],
  weight: "variable",
});

export const fontVariables = `${geistSans.variable} ${geistMono.variable} ${notoSansArabic.variable}`;
export const englishFontClassName = geistSans.className;
export const arabicFontClassName = notoSansArabic.className;
