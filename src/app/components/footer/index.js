import useHost from '@/app/hooks/use-host';
import { headers } from 'next/headers';
import VisitedCountries from '../visited-countries';
import useI18n from '@/app/hooks/use-i18n';

export default function Footer() {
  const host = useHost();
  const i18n = useI18n();
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

    <div style={{textAlign: 'center', marginBottom: 80}}>
      <a href={ (isBR ? 'https://viajarcomale.com' : 'https://viajarcomale.com.br') + headersList.get('x-pathname') } className="language" id="language-switcher">{ isBR ? 'English' : 'Português' }</a>

      <div className="developed-by" dangerouslySetInnerHTML={{__html: i18n('Developed by AS.dev and available on GitHub')
          .replace('AS.dev', '<a href="https://as.dev" target="_blank">AS.dev</a>')
          .replace('GitHub', '<a href="https://github.com/alefesouza/viajarcomale.com" target="_blank">GitHub</a>')}} />
    </div>
  </>
}
