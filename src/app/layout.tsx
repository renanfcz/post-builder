import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ErrorBoundary } from "@/components/error-boundary";
import { QueryProvider } from "@/lib/providers/query-provider";
import { IdentityProvider } from "@/lib/providers/identity-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Post Builder",
    default: "Post Builder - Crie posts incríveis para o LinkedIn",
  },
  description: "Ferramenta web minimalista para criação de posts do LinkedIn através de conversas com agente IA via webhook. Transforme suas ideias em posts profissionais otimizados.",
  keywords: [
    "LinkedIn",
    "posts",
    "IA",
    "inteligência artificial",
    "marketing",
    "redes sociais",
    "criação de conteúdo",
    "webhook",
  ],
  authors: [{ name: "Post Builder Team" }],
  creator: "Post Builder",
  publisher: "Post Builder",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Post Builder - Crie posts incríveis para o LinkedIn",
    description: "Transforme suas ideias em posts profissionais otimizados com IA",
    url: "/",
    siteName: "Post Builder",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Post Builder - Ferramenta de criação de posts para LinkedIn",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Post Builder - Crie posts incríveis para o LinkedIn",
    description: "Transforme suas ideias em posts profissionais otimizados com IA",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary>
          <QueryProvider>
            <IdentityProvider>
              {children}
            </IdentityProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
