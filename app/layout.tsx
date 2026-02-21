import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HelferAI Admin",
  description: "HelferAI Admin Dashboard — Inventory & Studio",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
