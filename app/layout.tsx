import type { Metadata } from "next";
import './globals.css';
import { Inter } from "next/font/google";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kivotos Developments",
  description: "Lorem Ipsum Dolor Sit Amet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
{/* Tenant Sidebar and Admin Sidebar make them appear on correct pages figure out how to render it maybe <aside> */ }