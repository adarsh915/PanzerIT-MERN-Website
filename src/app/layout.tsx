import type { Metadata } from "next";

import { Barlow } from 'next/font/google';

const barlow = Barlow({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-barlow',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.panzerit.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Panzer IT",
  description: "Panzer IT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const originalError = console.error;
              console.error = (...args) => {
                if (args[0] && typeof args[0] === 'string') {
                  if (args[0].includes('A tree hydrated but some attributes of the server rendered HTML didn\\'t match') && args[0].includes('fdprocessedid')) {
                    return;
                  }
                }
                originalError.call(console, ...args);
              };
            `
          }}
        />
      </head>
      <body className={barlow.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
