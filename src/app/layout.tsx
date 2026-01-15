import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          "min-h-screen bg-background font-sans antialiased"
        )}
      >
        <Providers>
          <main className="relative flex min-h-screen flex-col">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
