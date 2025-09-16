// src/app/layout.tsx
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DeepBet – Pronostici Top5",
  description: "Pronostici calcio Top5 EU con Poisson, Elo e stats.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        {/* Google Fonts (Lato) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="min-h-screen flex">
          <Sidebar />
          <main className="flex-1 p-3 sm:p-4 md:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
