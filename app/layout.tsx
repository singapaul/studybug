import type { Metadata } from "next";
import { Quicksand, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Studybug — Make Revision Fun",
    template: "%s | Studybug",
  },
  description:
    "Join thousands of students and teachers using Studybug to master any subject through engaging game-based learning.",
  keywords: ["revision", "flashcards", "education", "learning games", "students", "teachers"],
  authors: [{ name: "Studybug" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Studybug — Make Revision Fun",
    description:
      "Join thousands of students and teachers using Studybug to master any subject through engaging game-based learning.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${quicksand.variable} ${plusJakartaSans.variable}`}>
      <body>
        <SessionProvider>
          <QueryProvider>{children}</QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
