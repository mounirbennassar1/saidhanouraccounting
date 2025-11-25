import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Said App - Gestion de Caisse et Dépenses",
  description: "Application moderne de gestion de caisse, achats et charges pour Said App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="antialiased font-sans bg-[#0B0F19] text-slate-200 selection:bg-indigo-500/30">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


