import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SatQuery | Satellite Change Detection & 3D Topographic Analytics",
  description:
    "Production-ready satellite change detection, spectral differencing (NDVI, NDBI, NDWI, SAR), AI attribution, and 3D topographic analytics.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2306b6d4'><circle cx='12' cy='12' r='10'/></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
