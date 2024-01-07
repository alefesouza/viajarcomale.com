import links from './utils/links';
import HomeButton from './components/home-button';
import useI18n from './hooks/use-i18n';
import useHost from './hooks/use-host';
import Link from 'next/link';
import logAccess from './utils/log-access';
import { getFirestore } from 'firebase-admin/firestore';
import defaultMetadata from './utils/default-metadata';

export async function generateMetadata() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();

  const defaultMeta = defaultMetadata();

  return {
    ...defaultMeta,
    alternates: {
      ...defaultMeta.alternates,
      types: {
        'application/rss+xml': host('/rss'),
      },
    },
  };
}

export default async function Home() {
  const host = useHost();
  const i18n = useI18n();

  const db = getFirestore();
  logAccess(db, host('/'));

  return (
    <div className="container">
      <div className="list-group">
        <Link
          href="/countries"
          className="list-group-item list-group-item-action"
        >
          {i18n('Albums - Photos separated by country')}
        </Link>
        {links.map((l) => (
          <HomeButton
            key={l.text}
            text={l.translate ? i18n(l.text) : l.text}
            url={l.url}
            image={l.image ? host(l.image) : null}
          />
        ))}
        <a
          href="#"
          id="add-to-home"
          className="list-group-item list-group-item-action"
          style={{ display: 'none' }}
        >
          {i18n('Add to Home Screen')}
        </a>
      </div>
    </div>
  );
}
