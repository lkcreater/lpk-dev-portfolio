import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geist = localFont({
  src: "../assets/fonts/geist-variable.woff2",
  variable: "--font-geist",
  display: "swap",
});

const notoThai = localFont({
  src: "../assets/fonts/noto-sans-thai-variable.woff2",
  variable: "--font-thai",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lpk.studio"),
  title: "LPK — Creative Technologist",
  description: "Creative technology, design, AI and motion from Bangkok.",
  openGraph: {
    type: "website",
    images: [{ url: "/images/hero-sculpture.png", width: 1536, height: 896 }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} ${notoThai.variable}`}>
      <body>{children}</body>
    </html>
  );
}
