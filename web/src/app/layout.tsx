import { ReactNode } from "react";

import { ThemeConfig, ThemeModeScript } from "flowbite-react";
import type { Metadata } from "next";

import { ThemeInit } from "../../.flowbite-react/init";
import { Providers } from "../components/providers/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "My App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <ThemeInit />
        <ThemeModeScript />
        <ThemeConfig mode="light" />
      </head>
      <body>
        <Providers>
          <div className="flex min-h-screen flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
