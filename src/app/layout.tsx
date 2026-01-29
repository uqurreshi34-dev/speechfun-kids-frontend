// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react"; // ← add this if not already

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SpeechFun Kids",
  description: "Interactive speech therapy for children",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This is a client component now – we can use useSession here
  const { data: session } = useSession();

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gradient-to-b from-blue-50 to-purple-50 min-h-screen`}>
        <Navbar />

        <main className={`pt-20 md:pt-24 ${!session ? "pt-0 md:pt-0" : ""}`}>
          {children}
        </main>
      </body>
    </html>
  );
}
