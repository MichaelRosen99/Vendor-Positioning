import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vendor Positioning",
  description: "Compare technology vendors and their closest competitors at a glance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
