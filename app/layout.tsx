import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "./providers/QueryProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "HelferAI Admin",
  description: "HelferAI Admin Dashboard — Inventory & Studio",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}

