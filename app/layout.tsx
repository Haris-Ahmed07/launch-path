import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NextHire - AI-Powered Career Assistant",
  description: "Get personalized cover letters, learning roadmaps, study notes, and YouTube resources based on your resume and job description.",
  keywords: "AI, career, job search, cover letter, resume, learning, roadmap",
  authors: [{ name: "Haris Ahmed" }],
  openGraph: {
    title: "NextHire - AI-Powered Career Assistant",
    description: "Upload your resume and job description to get personalized career assistance.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}