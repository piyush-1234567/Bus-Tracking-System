
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Safar Saathi Driver App",
  description: "Driver dashboard for real-time tracking and status updates.",
};

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`font-sans ${fontBody.variable} bg-background`}>
        <main className="min-h-screen flex flex-col items-center justify-center p-4">
            {children}
        </main>
    </div>
  );
}
