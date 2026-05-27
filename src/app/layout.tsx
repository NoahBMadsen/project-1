import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bramble - Community Foraging App",
  description:
    "Identify wild plants with AI, keep a foraging journal, and share finds on a community map.",
  metadataBase: new URL("https://bramblemap.com"),
  openGraph: {
    title: "Bramble - Community Foraging App",
    description: "Identify wild plants with AI, keep a foraging journal, and share finds on a community map.",
    siteName: "Bramble",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
