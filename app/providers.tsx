"use client";

import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider } from "next-intl";

interface ProvidersProps {
    children: React.ReactNode;
    locale: string;
    messages: Record<string, unknown>;
}

export function Providers({ children, locale, messages }: ProvidersProps) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            storageKey="aria-theme"
        >
            <NextIntlClientProvider locale={locale} messages={messages}>
                {children}
            </NextIntlClientProvider>
        </ThemeProvider>
    );
}
