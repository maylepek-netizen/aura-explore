import type { Metadata } from "next";
import { Amiri, Assistant } from "next/font/google";
import "./globals.css";

const amiri = Amiri({
  variable: "--font-amiri",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AURA — Experience autism through different eyes",
  description:
    "AURA is an experiential viewer of pre-made autism simulations. Browse and watch situations rendered through a neurodivergent lens.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${amiri.variable} ${assistant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0807] text-[#f3ece4] font-[family-name:var(--font-assistant)]">
        {children}
      </body>
    </html>
  );
}
