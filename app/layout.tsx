import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { cookies } from "next/headers";
import { getMessages } from "next-intl/server";

export const metadata: Metadata = {
  title: "ARIA — Agentic Resource Intelligence for Academia",
  description:
    "Research-grade multi-agent AI system for academic resource allocation, demand forecasting, and decision provenance.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies(); // ✅ MUST await
  const locale = cookieStore.get("aria-locale")?.value ?? "en";

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}