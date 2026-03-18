import type { Metadata } from "next";
import { Exo_2 } from "next/font/google";
import "./globals.css";
import React from "react";

const exo2 = Exo_2({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Synapse MedTech Review",
  description: "Premium Learning Management System for MedTech students",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={exo2.className}>{children}</body>
    </html>
  );
}
