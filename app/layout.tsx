import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import InstallPrompt from "../components/InstallPrompt"; // <-- ADDED: Install Banner

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ADDED: Viewport export for the PWA theme color (Next.js 14+ standard)
export const viewport: Viewport = {
  themeColor: "#2563eb",
};

// ADDED: Manifest link for the PWA
export const metadata: Metadata = {
  title: "Flight Booking App",
  description: "A full-stack flight booking application",
  manifest: "/manifest.json", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        {children}
        <InstallPrompt /> {/* <-- ADDED: Renders the prompt across your app */}
      </body>
    </html>
  );
}