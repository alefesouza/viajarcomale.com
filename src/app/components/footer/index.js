import useHost from '@/app/hooks/use-host';
import { headers } from 'next/headers';
import VisitedCountries from '../visited-countries';
import Script from 'next/script';

export default function Footer({ breadcrumbs }) {
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  const headersList = headers();

  return <>
    <div className="bottom_links">
        <a href="https://instagram.com/viajarcomale" target="_blank">
            <img src={ host('logos/instagram.png') } width={32} height={32} alt="Instagram Icon" />
        </a>
        <a href="https://tiktok.com/@viajarcomale" target="_blank">
            <img src={ host('logos/tiktok.png') } width={32} height={32} alt="TikTok Icon" />
        </a>
        <a href="https://youtube.com/c/alefesouza" target="_blank">
            <img src={ host('logos/youtube.png') } width={32} height={22} alt="YouTube Icon" />
        </a>
        <a href="mailto:contato@viajarcomale.com" className="email_icon">@</a>
    </div>

    <div className="stickers">
        <img src={ host('icons/144x144.png') } srcSet={ host('icons/any.svg') } width={144} height={144} alt="Viajar com Alê Icon" />
        <img src={ host('images/asexplore-144.png') } srcSet={ host('images/asexplore-288.png') + ' 2x' } width={144} height={144} alt="ASExplore Icon" />
    </div>

    <VisitedCountries />

    <div style={{textAlign: 'center', marginBottom: 100}}>
      <a href={ (isBR ? 'https://viajarcomale.com' : 'https://viajarcomale.com.br') + headersList.get('x-pathname') } className="language">{ isBR ? 'English' : 'Português' }</a>
    </div>

    {breadcrumbs && breadcrumbs.length && <Script id="ld-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((item, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": item.name,
        "item": item.item
      }))
    }) }}></Script>}
  </>
}
