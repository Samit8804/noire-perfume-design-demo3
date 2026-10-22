import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const serif = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://noire-maison.com"),
  title: "NOIRÉ — Maison de Parfum",
  description:
    "NOIRÉ composes fragrance the way memory works — in shadow, in gold, in slow-burning detail. Three studies in shadow and gold: Noir, Golden Oud, Velvet Amber.",
  openGraph: {
    title: "NOIRÉ — Maison de Parfum",
    description:
      "A concept fragrance house. Scent is a memory — composed in shadow, worn like a secret.",
    type: "website",
    images: ["/images/hero-perfume.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a09",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable}`}>
        <a className="skip-link" href="#collection">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
