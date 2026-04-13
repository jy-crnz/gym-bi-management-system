import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TUP Manila • Gym BI Portal",
  description: "Secure student analytics and high-fidelity membership management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full selection:bg-emerald-500/30">
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          h-full 
          antialiased 
          bg-white 
          dark:bg-black 
          text-slate-900 
          dark:text-zinc-50
        `}
      >
        {children}
      </body>
    </html>
  );
}