import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "How Well Do You Know Me? 👀",
  description: "Create a quiz about yourself. Share it with friends. Find out who really knows you!",
  openGraph: {
    title: "How Well Do You Know Me? 👀",
    description: "Create a quiz. Share it. Find out who really remembers you.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="bg-[#0b0f19] text-gray-100 min-h-screen flex flex-col antialiased selection:bg-pink-500 selection:text-white">
        {/* Background mesh lights */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-500/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]" />
        </div>
        
        <main className="flex-1 flex flex-col">{children}</main>

        <footer className="py-6 text-center text-xs text-gray-500 border-t border-gray-800/50">
          <p>How Well Do You Know Me? 👀 &bull; Made for friends & laughter</p>
        </footer>
      </body>
    </html>
  );
}
