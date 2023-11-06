import countries from '../utils/countries';
import useI18n from '../hooks/use-i18n';
import styles from './page.module.css';
import Link from 'next/link';
import useHost from '../hooks/use-host';
import Top from '../components/top';
import Footer from '../components/footer';
import { SITE_NAME } from '../utils/constants';

export async function generateMetadata() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();
 
  return {
    title: i18n('Albums') + ' - ' + SITE_NAME,
  }
}

export default function Countries() {
  const i18n = useI18n();
  const host = useHost();

  return <main className="container">
    <Top />

    <Link href="/">
      <img src={host('/images/back.svg')} alt="Back Button" width="30px"></img>
    </Link>

    <h3>{i18n('Select Country')}</h3>

    <div className={styles.country_selector}>
      {countries.map(c => <Link href={`/countries/${c.slug}`} key={c.name} className={styles.country}>
        <span className={styles.country_flag}>{c.flag}</span>
        <span>{i18n(c.name)}</span>
      </Link>)}
    </div>

    <Footer />
  </main>
}
