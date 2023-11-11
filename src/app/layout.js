import './globals.css';
import { customInitApp } from './firebase';
customInitApp();
import Script from 'next/script';
import useHost from './hooks/use-host';
import useI18n from './hooks/use-i18n';
import { SITE_NAME } from './utils/constants';
import { headers } from 'next/headers';
import Top from './components/top';
import Footer from './components/footer';
import Autocomplete from './components/autocomplete';

export const metadata = {
  title: SITE_NAME,
  openGraph: {
    title: SITE_NAME,
  },
}

export default function RootLayout({ children }) {
  const host = useHost();
  const i18n = useI18n();
  const headersList = headers();
  const pathname = headersList.get('x-pathname');

  return (
    <html lang={ i18n('en') }>

      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta name="keywords" content="vlog, travel, traveling, viajar, viagens, alefe souza, fotos, photos, blog de viagens, instagram de viagens, canal de viagens, travel blog, travel instagram, travel channel, canal do youtube de viagens, travel youtube channel" />
        <meta name="author" content="Alefe Souza" />

        <meta name="theme-color" content="#2096cc" />

        <link rel="alternate" hrefLang="en-US" href="https://viajarcomale.com/" />
        <link rel="alternate" hrefLang="pt-BR" href="https://viajarcomale.com.br/" />
        <link rel="alternate" hrefLang="x-default" href="https://viajarcomale.com/" />

        <link rel="shortcut icon" href={ host('favicon.ico') } />
        <link rel="canonical" href={ new URL(pathname, host().includes('viajarcomale.com.br') ? 'https://viajarcomale.com.br' : 'https://viajarcomale.com').toString() } />

        <link rel="manifest" href={ host('manifest.json') } />
        <link rel="image_src" href={ host('profile-photo-2x.jpg') } />

        <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" sizes="60x60" href={ host('icons/60x60.jpg') } />
        <link rel="apple-touch-icon" sizes="76x76" href={ host('icons/76x76.jpg') } />
        <link rel="apple-touch-icon" sizes="120x120" href={ host('icons/120x120.jpg') } />
        <link rel="apple-touch-icon" sizes="152x152" href={ host('icons/152x152.jpg') } />
        <link rel="apple-touch-icon" sizes="167x167" href={ host('icons/167x167.jpg') } />
        <link rel="apple-touch-icon" sizes="180x180" href={ host('icons/180x180.jpg') } />

        <Script id="ld-website" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"http://schema.org","@type":"WebSite","url":host(''),"author":"Alefe Souza","name":SITE_NAME,"alternateName":[SITE_NAME, "@ViajarComAlê", "viajarcomale", "VCA", i18n('Travel with Alefe')],"description":i18n('Travel photos and links to Viajar com Alê social networks.'),"potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":host('') + "/hashtags/{search_term_string}"},"query-input":"required name=search_term_string"}}) }}></Script>
        <Script id="ld-organization" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"http://schema.org","@type":"Organization","url":host(''),"logo":host('/icons/512x512.png'),"email":"mailto:contato@viajarcomale.com","sameAs":["https://instagram.com/viajarcomale","https://tiktok.com/@viajarcomale","https://youtube.com/@viajarcomale","https://twitter.com/viajarcomale"]}) }}></Script>

        {pathname === '/' && <meta name="title" content={SITE_NAME} />}
        <meta name="description" content={i18n('Travel photos and links to Viajar com Alê social networks.')} />
        <meta name="image" content={ host('cover.jpg') }/>
        <meta property="og:locale" content={i18n('en_US')} />
        <meta property="og:type" content="website" />
        <meta property="og:description" content={i18n('Travel photos and links to Viajar com Alê social networks.')} />
        <meta property="og:url" content={ host('') } />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property='article:author' content='https://www.facebook.com/viajarcomale' />
        <meta property='article:publisher' content='https://www.facebook.com/viajarcomale' />
        <meta property="og:image" content={ host('cover.jpg') }/>
        <meta property="og:image:width" content="1280" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ host('cover.jpg') }/>
        <meta name="twitter:site" content="@viajarcomale" />
        <meta name="twitter:description" content={i18n('Travel photos and links to Viajar com Alê social networks.')} />

        <Script id="gtm" dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${process.env.NEXT_GTM_TRACKING}');`}}></Script>
      </head>

      <body>
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KG98M7XG" height="0" width="0" style={{ display: 'none', visibility: 'hidden'}}></iframe></noscript>

        <div className="background"></div>

        <div id="loader-spinner">
          <span className="loader"></span>
        </div>

        <header className="container">
          <div id="title-bar">
            <img src={ host('/icons/72x72.png') } alt="Viajar com Alê Icon" width={36} height={36}></img>

            <span>{SITE_NAME}</span>
          </div>

          <Autocomplete />

          <Top />
        </header>

        <main>
          {children}
        </main>

        <footer className="container">
          <Footer />
        </footer>

        <Script async src={ host('app.js') } />

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
