import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Certifox — Acreditación Técnica y Cursos Certificados",
  description:
    "Cursos técnicos y vocacionales dictados por instructores calificados con validación criptográfica y registro público inmutable.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-[#FFFDF9] text-[#0D1C2F]">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
