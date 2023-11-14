import countries from '../utils/countries';
import useI18n from '../hooks/use-i18n';
import styles from './page.module.css';
import Link from 'next/link';
import useHost from '../hooks/use-host';
import { SITE_NAME } from '../utils/constants';

export async function generateMetadata() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();
 
  const title = i18n('Albums') + ' - ' + SITE_NAME;
  const description = i18n('Choose which country to Travel with Alê.');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      title,
      description,
    },
    other: {
      title,
    },
  }
}

export default function Countries() {
  const i18n = useI18n();
  const host = useHost();

  return <div className="container">
    <Link href="/">
      <img src={host('/images/back.svg')} alt="Back Button" width="30px"></img>
    </Link>

    <h3>{i18n('Select Country')}</h3>

    <div className={styles.country_selector}>
      {countries.map(c => <Link href={`/countries/${c.slug}`} key={c.name} className={styles.country} prefetch={false}>
        <span className={styles.country_flag}>{c.flag}</span>
        <span>{i18n(c.name)}</span>
      </Link>)}
    </div>
  </div>
}
