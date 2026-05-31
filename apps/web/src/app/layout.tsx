import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AKDIA Enterprise AI Diagram Studio",
  description: "AI-powered architecture, diagramming, infographic, and document-to-diagram studio."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
