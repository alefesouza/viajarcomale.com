import useI18n from '@/app/hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import { getFirestore } from 'firebase-admin/firestore';
import styles from './page.module.css';
import { SITE_NAME } from '@/app/utils/constants';
import { redirect } from 'next/navigation';
import InstagramMedia from '@/app/components/instagram-media';
import ShareButton from '@/app/components/share-button';
import randomIntFromInterval from '@/app/utils/random-int';
import WebStories from '@/app/components/webstories';
import logAccess from '@/app/utils/log-access';
import StructuredBreadcrumbs from '@/app/components/structured-breadcrumbs';
import defaultMetadata from '@/app/utils/default-metadata';
import { headers } from 'next/headers';
import Country, {
  generateMetadata as generateMediaMetadata,
} from '../../posts/[...media]/page';
import { UAParser } from 'ua-parser-js';

async function getCountry(country, city) {
  const db = getFirestore();
  const countryDoc = await db.collection('countries').doc(country).get();
  const countryData = countryDoc.data();

  if (city && !countryData.cities.find((c) => c.slug === city)) {
    return false;
  }

  return countryData;
}

export async function generateMetadata({ params: { country, city, stories } }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  const isWebStories = stories && stories[0] === 'webstories';

  const countryData = await getCountry(country, city);

  if (!countryData) {
    redirect('/');
  }

  let theCity = null;

  if (city) {
    theCity = countryData.cities.find((c) => c.slug === city);
  }

  if (!theCity) {
    redirect('/');
  }

  let theMedia = null;

  const db = getFirestore();

  const instagramHighLightsSnapshot = await db
    .collection('countries')
    .doc(country)
    .collection('cities')
    .doc(city)
    .collection('medias')
    .where('type', '==', 'story')
    .where('is_highlight', '==', true)
    .get();

  instagramHighLightsSnapshot.forEach((media) => {
    const data = media.data();
    theMedia = data;
  });

  if (stories && stories[0] !== 'webstories') {
    return generateMediaMetadata({
      params: {
        country,
        city,
        media: [city + '-story-' + stories[0]],
      },
    });
  }

  if (
    (stories && stories.length > 2) ||
    (stories && stories[0] !== 'webstories')
  ) {
    redirect(`/countries/${country}/cities/${city}/stories`);
  }

  const location = [
    isBR && theCity.name_pt ? theCity.name_pt : theCity.name,
    i18n(countryData.name),
  ].join(' - ');
  const title = [
    i18n('Stories'),
    location,
    isWebStories ? 'Web Stories' : '',
    SITE_NAME,
  ]
    .filter((c) => c)
    .join(' - ');
  const description = i18n('Viajar com Alê stories in :location:', {
    location: isBR && theCity.name_pt ? theCity.name_pt : theCity.name,
  });

  return {
    ...defaultMetadata(title, description, theMedia),
    ...(!isWebStories
      ? {
          icons: {
            // Why Next.js doesn't just allow us to create custom <link> tags directly...
            other: {
              rel: 'amphtml',
              url: host(
                '/webstories/countries/' +
                  country +
                  '/cities/' +
                  city +
                  '/stories'
              ),
            },
          },
        }
      : null),
  };
}

export default async function Highlight({
  params: { country, city, stories },
  searchParams,
}) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  const isWindows =
    new UAParser(headers().get('user-agent')).getOS().name === 'Windows';

  let sort =
    (searchParams.sort &&
      ['asc', 'desc', 'random'].includes(searchParams.sort) &&
      searchParams.sort) ||
    'desc';

  if (stories && stories[0] === 'webstories') {
    if (!searchParams.sort || sort === 'desc') {
      sort = 'asc';
    } else if (sort === 'asc') {
      sort = 'desc';
    }
  }

  const countryData = await getCountry(country, city);

  if (!countryData) {
    redirect('/');
  }

  let theCity = countryData.cities.find((c) => c.slug === city);

  const db = getFirestore();
  let theMedia = null;

  const instagramHighLightsSnapshot = await db
    .collection('countries')
    .doc(country)
    .collection('cities')
    .doc(city)
    .collection('medias')
    .where('type', '==', 'story')
    .where('is_highlight', '==', true)
    .get();

  instagramHighLightsSnapshot.forEach((media) => {
    const data = media.data();
    data.type == 'instagram-highlight';
    delete data.location_data;
    delete data.hashtags;
    delete data.hashtags_pt;
    theMedia = data;
  });

  if (stories && stories[0] !== 'webstories') {
    return Country({
      params: {
        country,
        city,
        media: [city + '-story-' + stories[0]],
      },
    });
  }

  const cacheRef = `/caches/stories/stories/${theCity.slug}/sort/${
    sort === 'asc' ? 'asc' : 'desc'
  }`;

  const cache = await db.doc(cacheRef).get();

  let isRandom = sort === 'random';

  if (isRandom) {
    sort = 'desc';
  }

  let photos = [];

  if (!cache.exists) {
    const photosSnapshot = await db
      .collection('countries')
      .doc(country)
      .collection('cities')
      .doc(city)
      .collection('medias')
      .where('type', '==', 'story')
      .orderBy('date', sort)
      .get();

    photosSnapshot.forEach((photo) => {
      const data = photo.data();
      data.link =
        'https://www.instagram.com/stories/highlights/' +
        data.original_id +
        '/';

      photos = [...photos, data];
    });

    if (!photos.length) {
      redirect('/');
    }

    if (!isRandom && !cache.exists) {
      db.doc(cacheRef).set({
        photos,
        last_update: new Date().toISOString().split('T')[0],
      });
    }
  } else {
    photos = cache.data().photos;
  }

  if (isRandom) {
    photos = photos
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    sort = 'random';
  }

  const isWebStories = stories && stories[0] === 'webstories';
  logAccess(
    db,
    host((isWebStories ? '/webstories' : '') + '/stories/') +
      theCity.slug +
      ('?sort=' + sort)
  );

  let instagramStories = photos.filter((p) => p.type === 'story');

  if (stories && stories[0] === 'webstories') {
    const location = [
      isBR && theCity.name_pt ? theCity.name_pt : theCity.name,
      i18n(countryData.name),
    ].join(' - ');

    return (
      <WebStories
        title={location}
        storyTitle={location}
        items={instagramStories}
        highlightItem={theMedia}
        countryData={countryData}
      />
    );
  }

  let newShuffle = randomIntFromInterval(1, 15);

  if (newShuffle == searchParams.shuffle) {
    newShuffle = randomIntFromInterval(1, 15);
  }

  const basePath = '/countries/' + country + '/cities/' + city + '/stories';

  const breadcrumbs = [
    {
      name: i18n(countryData.name),
      item: `/countries/${country}`,
    },
    {
      name: isBR && theCity.name_pt ? theCity.name_pt : theCity.name,
      item: `/countries/${country}/cities/${city}`,
    },
    {
      name: 'Stories',
      item: basePath,
    },
  ];

  const sortPicker = (type) => (
    <div className="container-fluid">
      <div className="sort_picker">
        <span>{i18n('Sorting')}:</span>

        {[
          { name: 'Latest', value: 'desc' },
          { name: 'Oldest', value: 'asc' },
          { name: 'Random', value: 'random' },
        ].map((o) => (
          <Link
            key={o}
            href={
              o.value === 'random'
                ? sort === 'random'
                  ? basePath
                  : basePath + '?sort=random&shuffle=' + newShuffle
                : o.value !== 'desc'
                ? '?sort=' + o.value
                : basePath
            }
            scroll={false}
          >
            <label>
              <input
                type="radio"
                name={'sort-' + type}
                value={o.value}
                checked={sort === o.value}
                readOnly
              />
              {i18n(o.name)}
            </label>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Link
            href={'/countries/' + country + '/cities/' + city}
            id="back-button"
            className={styles.history_back_button}
            scroll={false}
          >
            <img src="/images/back.svg" alt={i18n('Back')} width="32px"></img>
          </Link>

          <div style={{ display: 'flex', gap: 16 }}>
            {
              <a
                href={host(
                  '/webstories/countries/' +
                    country +
                    '/cities/' +
                    city +
                    '/stories' +
                    (sort !== 'desc' ? '?sort=' + sort : '')
                )}
                target="_blank"
                title={i18n('Play')}
              >
                <img
                  src={host('/images/play.svg')}
                  width={32}
                  height={32}
                  alt={i18n('Play')}
                />
              </a>
            }
            <ShareButton />
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <h2 className={isWindows ? 'windows-header' : null}>
          {i18n('Stories')} -{' '}
          <Link
            href={'/countries/' + country + '/cities/' + city}
            scroll={false}
            prefetch={false}
            style={{ textDecoration: 'underline' }}
          >
            {isBR && theCity.name_pt ? theCity.name_pt : theCity.name}
          </Link>{' '}
          -{' '}
          <Link
            href={'/countries/' + country}
            scroll={false}
            prefetch={false}
            style={{ textDecoration: 'underline' }}
          >
            {i18n(countryData.name)}
          </Link>{' '}
          {isWindows ? (
            <img
              src={host('/flags/' + countryData.slug + '.png')}
              alt={i18n(countryData.name)}
              width={26}
              height={26}
            />
          ) : (
            countryData.flag
          )}
        </h2>
      </div>

      <div className="center_link" style={{ marginTop: 28 }}>
        <a
          href={host(
            '/webstories/countries/' +
              country +
              '/cities/' +
              city +
              '/stories' +
              (sort !== 'desc' ? '?sort=' + sort : '')
          )}
          target="_blank"
        >
          {i18n('Open in Stories format')}
        </a>
      </div>

      <div className={styles.galleries}>
        {instagramStories.filter((p) => !p.file_type).length > 1 &&
          sortPicker('photos')}

        {instagramStories.filter((p) => !p.file_type).length > 0 && (
          <div className="container-fluid">
            <div className={styles.instagram_photos}>
              <div className={styles.instagram_photos_title}>
                <h3>{i18n('Stories')}</h3>
              </div>

              <div className="instagram_highlights_items">
                {instagramStories.map((p) => (
                  <InstagramMedia
                    key={p.id}
                    media={p}
                    isBR={isBR}
                    hasPoster
                    isListing
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <StructuredBreadcrumbs breadcrumbs={breadcrumbs} />
    </div>
  );
}
