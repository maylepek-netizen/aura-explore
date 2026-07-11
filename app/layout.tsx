import type { Metadata } from "next";
import { Amiri, Assistant } from "next/font/google";
import "./globals.css";
import { TransitionProvider } from "./TransitionProvider";
import { BackgroundMusic } from "./BackgroundMusic";

const amiri = Amiri({
  variable: "--font-amiri",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const assistant = Assistant({
  variable: "--font-assistant",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "hebrew"],
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
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-[#ffc99d] selection:text-black">
        <TransitionProvider>
          <BackgroundMusic />
          <div className="page-fade" style={{ display: "contents" }}>
            {children}
          </div>
        </TransitionProvider>
      </body>
    </html>
  );
}
