import type { Metadata } from "next";
<<<<<<< HEAD
import { Geist } from "next/font/google";
=======
import { Geist, Geist_Mono } from "next/font/google";
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

<<<<<<< HEAD
=======
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59

export const metadata: Metadata = {
  title: "SIH Evaluation Center — VIT",
  description: "Smart India Hackathon institutional evaluation portal for VIT. Secure, role-based evaluation with Supabase RLS.",
};

<<<<<<< HEAD
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full`}
=======
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
    >
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
