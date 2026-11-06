import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "./providers/QueryProvider";
import ServiceWorker from "./providers/ServiceWorker";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "HelferAI Admin",
  description: "HelferAI Admin Dashboard — Inventory & Studio",
  applicationName: "Helfer Admin",
  appleWebApp: { capable: true, title: "Helfer Admin", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#0b1424",
  // Fixed size on phones: no pinch-zoom or sliding the page around
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster position="top-right" richColors />
        <ServiceWorker />
      </body>
    </html>
  );
}

