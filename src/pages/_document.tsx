import Document, { Head, Html, Main, NextScript } from "next/document";
import Script from "next/script";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta name="description" content="Tailwind CSS code generator" />
          <meta
            property="og:description"
            content="Tailwind CSS lover and code generator enthusiast. Always on the lookout for new ways to make web development easier. 
"
          />
          <meta property="og:title" content="Tailwind CSS code generator" />
          <meta
            name="twitter:description"
            content="Tailwind CSS lover and code generator enthusiast. Always on the lookout for new ways to make web development easier. 
"
          />
          <meta
            property="og:image"
            content="https://openai.maqib.cn/og-image.png"
          />
          <meta
            name="twitter:image"
            content="https://openai.maqib.cn/og-image.png"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-B2T899502N"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-B2T899502N');
        `}
          </Script>
        </body>
      </Html>
    );
  }
}

export default MyDocument;
