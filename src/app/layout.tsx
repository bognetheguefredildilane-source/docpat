import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ClerkBridge } from "@/Components/auth/ClerkBridge";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Docpat - Centre Médical & Prise de Rendez-vous",
  description: "Plateforme médicale 100% Front-End",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >

      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <ClerkProvider>
          <AppProvider>
            <ClerkBridge/>
            {children}
          </AppProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}