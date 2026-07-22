import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grounded",
  description: "A full-stack wellness tracking app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
