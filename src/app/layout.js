import './globals.css';
import Script from 'next/script';
import getURL from './utils/get-url';
import { headers } from 'next/headers'
import { getI18n } from './utils/get-i18n';

export default function RootLayout({ children }) {
  const headersList = headers();

  return (
    <html lang={ getI18n(headersList, 'en') }>

      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Viajar com Alê</title>

      <meta name="keywords" content="vlog, travel, traveling, viajar, viagens, alefe souza, fotos, photos, blog de viagens, instagram de viagens, canal de viagens, travel blog, travel instagram, travel channel, canal do youtube de viagens, travel youtube channel" />
      <meta name="author" content="Alefe Souza" />

      <meta name="theme-color" content="#2096cc" />

      <link rel="alternate" hrefLang="pt-BR" href="https://viajarcomale.com.br/" />
      <link rel="alternate" hrefLang="x-default" href="https://viajarcomale.com/" />

      <link rel="shortcut icon" href={ getURL(headersList, 'favicon.ico') } />

      <link rel="manifest" href={ getURL(headersList, getI18n(headersList, 'manifest.json')) } />

      <meta name="apple-mobile-web-app-title" content="Viajar com Alê" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <link rel="apple-touch-icon" sizes="60x60" href={ getURL(headersList, 'icons/60x60.jpg') } />
      <link rel="apple-touch-icon" sizes="76x76" href={ getURL(headersList, 'icons/76x76.jpg') } />
      <link rel="apple-touch-icon" sizes="120x120" href={ getURL(headersList, 'icons/120x120.jpg') } />
      <link rel="apple-touch-icon" sizes="152x152" href={ getURL(headersList, 'icons/152x152.jpg') } />
      <link rel="apple-touch-icon" sizes="167x167" href={ getURL(headersList, 'icons/167x167.jpg') } />
      <link rel="apple-touch-icon" sizes="180x180" href={ getURL(headersList, 'icons/180x180.jpg') } />

      <Script id="ld-website" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"http://schema.org","@type":"WebSite","url":getURL(headersList, ''),"author":"Alefe Souza","name":"Viajar com Alê","alternateName":"Viajar com Alê","description":getI18n(headersList, 'Links to Viajar com Alê social networks.'),"potentialAction":{"@type":"SearchAction","target":getURL(headersList, '') + "?s={search_term_string}","query-input":"required name=search_term_string"}}) }}></Script>
      <Script id="ld-person" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"http://schema.org","@type":"Person","url":getURL(headersList, ''),"name":"Viajar com Alê","image":"https://viajarcomale.com/profile-photo","email":"mailto:contato@viajarcomale.com","jobTitle":"Traveler","worksFor":"Viajar com Alê","nationality":"Brazilian","sameAs":["https://instagram.com/viajarcomale","https://tiktok.com/@viajarcomale","https://youtube.com/@viajarcomale","https://twitter.com/viajarcomale"]}) }}></Script>

      <meta name="description" content={getI18n(headersList, 'Links to Viajar com Alê social networks.')} />
      <link rel="canonical" href={ getURL(headersList, '') } />
      <meta property="og:locale" content={getI18n(headersList, 'en_US')} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Viajar com Alê" />
      <meta property="og:description" content={getI18n(headersList, 'Links to Viajar com Alê social networks.')} />
      <meta property="og:url" content={ getURL(headersList, '') } />
      <meta property="og:site_name" content="Viajar com Alê" />
      <meta property='article:author' content='https://www.facebook.com/viajarcomale' />
      <meta property='article:publisher' content='https://www.facebook.com/viajarcomale' />
      <meta property="og:image" content={ getURL(headersList, 'cover.jpg') }/>
      <meta property="og:image:width" content="1280" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpg" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={ getURL(headersList, 'cover.jpg') }/>
      <meta name="twitter:site" content="@viajarcomale" />

      <Script id="gtm" dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${process.env.NEXT_GTM_TRACKING}');`}}></Script>

      <body>
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KG98M7XG" height="0" width="0" style={{ display: 'none', visibility: 'hidden'}}></iframe></noscript>

        <div className="background"></div>
        
        {children}

        <Script async src={ getURL(headersList, 'app.js') } />

        <Script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_GA_TRACKING}`} />
        <Script async id="analytics" dangerouslySetInnerHTML={{__html:`
            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments); }
            gtag('js', new Date());

            gtag('config', '${process.env.NEXT_GA_TRACKING}');
          `}}>
        </Script>
      </body>
    </html>
  )
}
