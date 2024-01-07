import useHost from '@/app/hooks/use-host';
import { headers } from 'next/headers';
import VisitedCountries from '../visited-countries';
import useI18n from '@/app/hooks/use-i18n';
import { UAParser } from 'ua-parser-js';
import styles from './index.module.css';
import Link from 'next/link';

export default function Footer() {
  const host = useHost();
  const i18n = useI18n();
  const isBR = host().includes('viajarcomale.com.br');
  const headersList = headers();
  const isWindows =
    new UAParser(headers().get('user-agent')).getOS().name === 'Windows';

  return (
    <footer>
      <div className="container">
        <div className="bottom_links">
          <a href="https://instagram.com/viajarcomale" target="_blank">
            <img
              src={host('logos/instagram.png')}
              width={32}
              height={32}
              alt={i18n('Instagram Icon')}
            />
          </a>
          <a href="https://tiktok.com/@viajarcomale" target="_blank">
            <img
              src={host('logos/tiktok.png')}
              width={32}
              height={32}
              alt={i18n('TikTok Icon')}
            />
          </a>
          <a href="https://youtube.com/c/alefesouza" target="_blank">
            <img
              src={host('logos/youtube.png')}
              width={32}
              height={22}
              alt={i18n('YouTube Icon')}
            />
          </a>
          <a href="mailto:contato@viajarcomale.com" className="email_icon">
            @
          </a>
        </div>

        <div className="stickers">
          <img
            src={host('icons/144x144.png')}
            srcSet={host('icons/any.svg')}
            width={144}
            height={144}
            alt={i18n('Viajar com Alê Icon')}
          />
          <img
            src={host('images/asexplore-144.png')}
            srcSet={host('images/asexplore-288.png') + ' 2x'}
            width={144}
            height={144}
            alt={i18n('ASExplore Icon')}
          />
        </div>
      </div>

      <div className="container-fluid">
        <VisitedCountries />
      </div>

      <div className={styles.footer + ' container'}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <a
            href={
              (isBR
                ? 'https://viajarcomale.com'
                : 'https://viajarcomale.com.br') + headersList.get('x-pathname')
            }
            id="language-switcher"
          >
            {isBR ? 'English Website' : 'Site em Português'}
          </a>
          <span>•</span>
          <Link href={host('/privacy-policy')} prefetch={false}>
            {i18n('Privacy Policy')}
          </Link>
          <span>•</span>
          <Link href={host('/contact')} target="_blank" prefetch={false}>
            {i18n('Contact')}
          </Link>
        </div>

        <div
          className="developed-by"
          dangerouslySetInnerHTML={{
            __html:
              i18n('Developed by AS.dev and available on GitHub')
                .replace(
                  'AS.dev',
                  '<a href="https://as.dev" target="_blank">AS.dev</a>'
                )
                .replace(
                  'GitHub',
                  '<a href="https://github.com/alefesouza/viajarcomale.com" target="_blank">GitHub</a>'
                ) +
              (isWindows
                ? '<br><br>' +
                  i18n('Flag emojis by Twemoji').replace(
                    'Twemoji',
                    '<a href="https://twemoji.twitter.com/" target="_blank">Twemoji</a>'
                  )
                : ''),
          }}
        />
      </div>
    </footer>
  );
}
