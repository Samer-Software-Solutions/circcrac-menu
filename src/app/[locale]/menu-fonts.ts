import { Fraunces, Markazi_Text } from "next/font/google";

// Display typefaces reserved for the public menu (restaurant name, category
// numerals, item names, spotlight headings). Kept out of `@/app/fonts` so the
// admin CMS never loads them.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: "variable",
});

const markaziText = Markazi_Text({
  variable: "--font-markazi-text",
  subsets: ["arabic"],
  weight: "variable",
});

export const menuFontVariables = `${fraunces.variable} ${markaziText.variable}`;
