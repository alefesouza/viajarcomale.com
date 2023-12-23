import countries from '../utils/countries';
import useI18n from '../hooks/use-i18n';
import styles from './page.module.css';
import Link from 'next/link';
import useHost from '../hooks/use-host';
import { SITE_NAME } from '../utils/constants';
import ShareButton from '../components/share-button';
import defaultMetadata from '../utils/default-metadata';
import { headers } from 'next/headers';
import logAccess from '../utils/log-access';
import { getFirestore } from 'firebase-admin/firestore';
import { UAParser } from 'ua-parser-js';

export async function generateMetadata() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();

  const title = i18n('Albums') + ' - ' + SITE_NAME;
  const description = i18n('Choose which country to travel with me.');

  return defaultMetadata(title, description);
}

export default function Countries() {
  const i18n = useI18n();
  const host = useHost();
  const isWindows =
    new UAParser(headers().get('user-agent')).getOS().name === 'Windows';

  const db = getFirestore();
  logAccess(db, host('/countries'));

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Link href="/" id="back-button" scroll={false}>
          <img
            src={host('/images/back.svg')}
            alt={i18n('Back')}
            width="32px"
          ></img>
        </Link>

        <ShareButton />
      </div>

      <h2>{i18n('Select Country')}</h2>

      <div className={styles.country_selector}>
        {countries.map((c) => (
          <Link
            href={`/countries/${c.slug}`}
            key={c.name}
            className={styles.country}
            prefetch={false}
          >
            <span className={styles.country_flag}>
              {isWindows ? (
                <img
                  src={host('/flags/' + c.slug + '.png')}
                  alt={i18n(c.name)}
                  width={30}
                  height={30}
                />
              ) : (
                c.flag
              )}
            </span>
            <span>{i18n(c.name)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
