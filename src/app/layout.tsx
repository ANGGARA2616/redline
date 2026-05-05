import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

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
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
