import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store Lab Admin",
  description: "Admin console for Store Lab",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

