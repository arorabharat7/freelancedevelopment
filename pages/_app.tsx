import '../styles/globals.css';
import '../styles/styles.css'; // Add this line to import your custom styles
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { AppProps } from 'next/app';
import Script from 'next/script';
import { SpeedInsights } from '@vercel/speed-insights/next';
function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [loadGTM, setLoadGTM] = useState(false);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (window.gtag) {
        window.gtag('config', 'G-310RX2WPT6', {
          page_path: url,
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    const handleUserInteraction = () => {
      setLoadGTM(true);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
    };

    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('scroll', handleUserInteraction);

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
    };
  }, []);

  return (
    <>
      {loadGTM && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=G-310RX2WPT6`}
            defer
          />
          <Script
            id="gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-310RX2WPT6', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
      <Component {...pageProps} />
      <SpeedInsights />
    </>
  );
}

export default MyApp;
