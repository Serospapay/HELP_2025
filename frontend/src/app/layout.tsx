import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { MainNav } from "@/components/layout/MainNav";
import { AppFooter } from "@/components/layout/AppFooter";
import { Providers } from "@/components/providers/Providers";

const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://volunteer-platform.local"),
  title: {
    default: "Платформа волонтерських проєктів",
    template: "%s · Платформа волонтерів",
  },
  description:
    "Єдина платформа для координаторів, волонтерів та отримувачів допомоги. Створюйте кампанії, керуйте змінами та залучайте донорів прозоро.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={`${inter.variable} ${manrope.variable}`}>
      <body className="bg-slate-950 font-sans text-slate-50">
        <Providers>
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-white"
          >
            Перейти до основного контенту
          </a>
          <div className="flex min-h-screen flex-col">
            <MainNav />
            <main id="content" className="flex-1">
              {children}
            </main>
            <AppFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
