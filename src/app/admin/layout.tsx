import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { fontVariables } from "../fonts";
import { Toaster } from "@/components/admin/ui/Toaster";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Admin · Maa Kali Astuti", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0E3B30",
};

export default function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en" className={fontVariables}>
      <body className="bg-iv text-ink font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
