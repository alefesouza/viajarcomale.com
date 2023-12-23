import LocationsMap from '../components/locations-map';
import { getFirestore } from 'firebase-admin/firestore';
import logAccess from '../utils/log-access';
import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import { SITE_NAME } from '../utils/constants';
import Link from 'next/link';
import ShareButton from '../components/share-button';
import defaultMetadata from '../utils/default-metadata';

export async function generateMetadata() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();

  const title = i18n('Map') + ' - ' + SITE_NAME;
  const description = i18n('The map of the places I have been.');

  return defaultMetadata(title, description);
}

export default async function MapPage() {
  const i18n = useI18n();
  const host = useHost();

  const cacheRef = '/caches/static_pages/static_pages/locations';

  const db = getFirestore();
  const cache = await db.doc(cacheRef).get();

  let locations = [];

  if (!cache.exists) {
    const locationsSnapshot = await db.collectionGroup('locations').get();

    locationsSnapshot.forEach((photo) => {
      const data = photo.data();

      locations = [...locations, data];
    });

    db.doc(cacheRef).set({
      locations,
      last_update: new Date().toISOString().split('T')[0],
    });
  } else {
    locations = cache.data().locations;
  }

  logAccess(db, host('/map'));

  return (
    <div>
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

      <h2 style={{ textAlign: 'center' }}>{i18n('Places I have been')}</h2>
      <LocationsMap
        locations={locations}
        loadingText={i18n('Loading')}
        resetZoomText={i18n('Reset Zoom')}
        apiKey={process.env.NEXT_MAPS_API_KEY}
      />
    </div>
  );
}
