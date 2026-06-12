import type { Metadata } from "next";
import "./globals.css";
import { LocaleProvider } from "@/lib/i18n/context";

// NB International Pro is loaded via @font-face in globals.css so the build
// still works when the (licensed, uncommitted) font files are absent.

export const metadata: Metadata = {
  title: "Venezuela Visa Application · VisaVenezuela",
  description:
    "Apply online for a visa to Venezuela: tourism, business, transit, study and work. Transparent process, open source.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="ambient min-h-full flex flex-col">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
