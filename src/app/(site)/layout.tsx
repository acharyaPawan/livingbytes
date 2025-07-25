import "@/styles/globals.css";

import { Inter } from "next/font/google";
import { cookies } from "next/headers";

import { TRPCReactProvider } from "@/trpc/react";

import { ThemeProvider } from "@/components/theme-provider";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Toaster } from "@/components/ui/toaster";
import { EdgeStoreProvider } from "@/lib/edgestore";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Create T3 App",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`h-screen bg-zinc-100 font-sans text-neutral-950 dark:bg-zinc-900 dark:text-neutral-100 ${inter.variable}`}
        style={{ lineHeight: "1.5" }}
        suppressHydrationWarning={true as const}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
        <TRPCReactProvider cookies={cookies().toString()}>
            <EdgeStoreProvider>{children}</EdgeStoreProvider>
            <Toaster />
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}        </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
