import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "StudyBug — Build your SaaS faster",
    template: "%s | StudyBug",
  },
  description:
    "The production-ready Next.js starter with auth, billing, and error monitoring pre-wired.",
  keywords: ["SaaS", "Next.js", "starter", "template"],
  authors: [{ name: "StudyBug" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "StudyBug — Build your SaaS faster",
    description:
      "The production-ready Next.js starter with auth, billing, and error monitoring pre-wired.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
