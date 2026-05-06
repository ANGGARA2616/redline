import type { Metadata } from "next";
import { Poppins, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "QueueBareng — Manajemen Antrian Main Bareng ML",
    template: "%s | QueueBareng",
  },
  description:
    "Platform SaaS untuk live streamer Mobile Legends mengelola antrian main bareng secara real-time, otomatis, dan anti-dispute.",
  keywords: [
    "main bareng",
    "mobile legends",
    "antrian",
    "live streaming",
    "queue management",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`h-full antialiased ${poppins.variable} ${dmSans.variable}`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
