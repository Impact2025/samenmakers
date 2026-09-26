import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { TRPCProvider } from "@/components/providers/trpc-provider";
import { SwRegister } from "@/components/providers/sw-register";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f9f9ff",
};

export const metadata: Metadata = {
  title: {
    default: "We Shape the Future — Vind je medemissie-ondernemer",
    template: "%s | We Shape the Future",
  },
  description:
    "Het platform waar purpose-driven ondernemers elkaar vinden en versterken.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    title: "We Shape the Future",
    description:
      "Het platform waar purpose-driven ondernemers elkaar vinden en versterken.",
    siteName: "We Shape the Future",
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
    <html lang="nl" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="font-sans antialiased">
        <TRPCProvider>
          {children}
          <SwRegister />
        </TRPCProvider>
      </body>
    </html>
  );
}
