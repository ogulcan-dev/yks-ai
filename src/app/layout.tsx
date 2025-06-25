import type { Metadata } from "next";
import "../style/globals.css";

export const metadata: Metadata = {
  title: "YKS AI Asistanı",
  description: "MEB müfredatına uygun YKS soru çözüm asistanı",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
