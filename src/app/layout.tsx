import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "SoftWater Assist",
  description: "Water softener education chatbot (simulated demo)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-slate-900">
        <div className="flex h-dvh flex-col">
          <div className="min-h-0 flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
