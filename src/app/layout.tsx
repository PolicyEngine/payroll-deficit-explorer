import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

const SITE_URL = "https://payroll-deficit-explorer.policyengine.org";
const OG_IMAGE = `${SITE_URL}/og-image.png`;
const DESCRIPTION =
  "How much would payroll tax rates need to rise to eliminate the 2036 primary deficit? Interactive PolicyEngine × CBO baseline.";

export const metadata: Metadata = {
  title: "Payroll Tax Deficit Explorer — PolicyEngine",
  description: DESCRIPTION,
  authors: [{ name: "PolicyEngine" }],
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "PolicyEngine",
    title: "Payroll Tax Deficit Explorer — PolicyEngine",
    description: DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Payroll Tax Deficit Explorer showing interactive charts of payroll tax rates and deficit projections",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ThePolicyEngine",
    title: "Payroll Tax Deficit Explorer — PolicyEngine",
    description: DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        alt: "Payroll Tax Deficit Explorer showing interactive charts of payroll tax rates and deficit projections",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#2C7A7B",
  width: "device-width",
  initialScale: 1.0,
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Payroll Tax Deficit Explorer",
  description:
    "Interactive tool exploring how much payroll tax rates would need to rise to eliminate the 2036 primary deficit, using PolicyEngine and CBO baseline data.",
  url: `${SITE_URL}/`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  author: {
    "@type": "Organization",
    name: "PolicyEngine",
    url: "https://policyengine.org",
  },
  publisher: {
    "@type": "Organization",
    name: "PolicyEngine",
    url: "https://policyengine.org",
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/favicon.svg`,
    },
  },
  isAccessibleForFree: true,
  browserRequirements: "Requires JavaScript",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

const ANALYTICS_INLINE = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-2YHG89FY0N', { tool_name: 'payroll-deficit-explorer' });
`;

const SCROLL_INLINE = `
(function() {
  var TOOL_NAME = 'payroll-deficit-explorer';
  if (typeof window === 'undefined' || !window.gtag) return;

  var scrollFired = {};
  window.addEventListener('scroll', function() {
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    var pct = Math.floor((window.scrollY / docHeight) * 100);
    [25, 50, 75, 100].forEach(function(m) {
      if (pct >= m && !scrollFired[m]) {
        scrollFired[m] = true;
        window.gtag('event', 'scroll_depth', { percent: m, tool_name: TOOL_NAME });
      }
    });
  }, { passive: true });

  [30, 60, 120, 300].forEach(function(sec) {
    setTimeout(function() {
      if (document.visibilityState !== 'hidden') {
        window.gtag('event', 'time_on_tool', { seconds: sec, tool_name: TOOL_NAME });
      }
    }, sec * 1000);
  });

  document.addEventListener('click', function(e) {
    var link = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!link || !link.href) return;
    try {
      var url = new URL(link.href, window.location.origin);
      if (url.hostname && url.hostname !== window.location.hostname) {
        window.gtag('event', 'outbound_click', {
          url: link.href,
          target_hostname: url.hostname,
          tool_name: TOOL_NAME
        });
      }
    } catch (err) {}
  });
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body>
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2YHG89FY0N"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {ANALYTICS_INLINE}
        </Script>
        <Script id="scroll-tracking" strategy="afterInteractive">
          {SCROLL_INLINE}
        </Script>
        <noscript>
          <h1>Payroll Tax Deficit Explorer</h1>
          <p>
            This interactive tool explores how much federal payroll tax rates
            would need to rise to eliminate the projected 2036 primary deficit,
            using PolicyEngine microsimulation and CBO baseline data. Please
            enable JavaScript to use this application.
          </p>
          <p>
            Learn more at <a href="https://policyengine.org">PolicyEngine</a>.
          </p>
        </noscript>
      </body>
    </html>
  );
}
