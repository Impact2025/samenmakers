import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { TRPCProvider } from "@/components/providers/trpc-provider";
import { SwRegister } from "@/components/providers/sw-register";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "600", "700", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Samenmakers — Vind je medemissie-ondernemer",
    template: "%s | Samenmakers",
  },
  description:
    "Het platform waar purpose-driven ondernemers elkaar vinden en versterken.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    title: "Samenmakers",
    description:
      "Het platform waar purpose-driven ondernemers elkaar vinden en versterken.",
    siteName: "Samenmakers",
    locale: "nl_NL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={inter.variable}>
      <body className="font-sans antialiased">
        <TRPCProvider>
          {children}
          <SwRegister />
        </TRPCProvider>
      </body>
    </html>
  );
}
