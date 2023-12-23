import { getFirestore } from 'firebase-admin/firestore';
import Link from 'next/link';
import ShareButton from '../components/share-button';
import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import { SITE_NAME } from '../utils/constants';
import defaultMetadata from '../utils/default-metadata';

export async function generateMetadata() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();

  const title = i18n('About') + ' - ' + SITE_NAME;
  const description = i18n('About Viajar com Alê website.');

  return defaultMetadata(title, description);
}

export default async function About() {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  const db = getFirestore();
  const aboutRef = await db.doc('/about/about').get();
  const aboutData = aboutRef.data();

  return (
    <>
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
      </div>
      <div
        className="page"
        dangerouslySetInnerHTML={{
          __html:
            isBR && aboutData.text_pt ? aboutData.text_pt : aboutData.text,
        }}
      ></div>
    </>
  );
}
