import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Back to Class",
  description: "Party games for our high school reunion. Runs on one phone.",
};

export const viewport: Viewport = {
  themeColor: "#1b0b33",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex h-full flex-col">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
