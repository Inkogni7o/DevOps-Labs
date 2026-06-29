import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store Lab",
  description: "Online store for Kubernetes labs",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

