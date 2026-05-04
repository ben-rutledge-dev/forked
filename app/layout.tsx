import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Providers } from "./providers";
import Nav from "@/components/Nav";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Forked",
    template: "%s — Forked",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="antialiased min-h-screen text-stone-900">
        <Providers session={session}>
          <Nav />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
