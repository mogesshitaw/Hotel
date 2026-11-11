import "./globals.css";
import type { Metadata } from "next";
import { GlobalThemeLangProvider } from "@/context/ThemeLangContext";

export const metadata: Metadata = {
  title: "Restaurant SaaS & Digital Menu",
  description: "All-in-one Multi-Tenant Restaurant SaaS Platform, POS, KDS & QR Menu",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Blocking inline script — runs before React hydrates and before any
          CSS paint. Reads localStorage and applies the saved theme class to
          <html> immediately so there is ZERO flash of wrong theme on load.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var theme = localStorage.getItem('global_app_theme');
    var root  = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  } catch(e) {
    document.documentElement.classList.add('dark');
  }
})();
            `.trim(),
          }}
        />
      </head>
      <body
        className="antialiased min-h-screen transition-colors duration-200"
        suppressHydrationWarning
      >
        <GlobalThemeLangProvider>{children}</GlobalThemeLangProvider>
      </body>
    </html>
  );
}
