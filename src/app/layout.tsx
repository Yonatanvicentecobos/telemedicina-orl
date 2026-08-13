import type { Metadata, Viewport } from "next";
import ServiceWorkerRegister from "./sw-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "Telemedicina ORL",
  description: "Videoconsultas de Otorrinolaringología",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#0f6e5f"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
