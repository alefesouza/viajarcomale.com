import useI18n from '@/app/hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import { getFirestore } from 'firebase-admin/firestore';
import styles from './page.module.css';
import { redirect } from 'next/navigation';
import InstagramMedia from '@/app/components/instagram-media';
import Link from 'next/link';
import ShareButton from '@/app/components/share-button';
import StructuredBreadcrumbs from '@/app/components/structured-breadcrumbs';
import Script from 'next/script';
import Pagination from '@/app/components/pagination';
import getMetadata from '@/app/utils/get-metadata';
import defaultMetadata from '@/app/utils/default-metadata';
import logAccess from '@/app/utils/log-access';
import { headers } from 'next/headers';
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

function getSelectedMedia(media, theMedia, country, city) {
  let mediaIndex = null;

  if (media[1]) {
    mediaIndex = parseInt(media[1]);

    if (
      mediaIndex != media[1] ||
      mediaIndex < 1 ||
      (!theMedia.gallery && mediaIndex > 1) ||
      mediaIndex > (theMedia.gallery || []).length + 1
    ) {
      redirect(
        '/countries/' + country + '/cities/' + city + '/posts/' + media[0]
      );
    }

    if (mediaIndex !== 1) {
      theMedia = theMedia.gallery[mediaIndex - 2];
      delete theMedia.is_gallery;
    }

    delete theMedia.gallery;
  }

  return {
    mediaIndex,
    selectedMedia: theMedia,
  };
}

export async function generateMetadata({ params: { country, city, media } }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

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

  const db = getFirestore();
  const mediaRef = await db
    .collection('countries')
    .doc(country)
    .collection('medias')
    .doc(media[0].startsWith('story-') ? media[0] : 'media-' + media[0])
    .get();
  let theMedia = mediaRef.data();

  if (!theMedia) {
    redirect('/');
  }

  if (theMedia.gallery && theMedia.gallery.length) {
    theMedia.gallery = theMedia.gallery.map((g, i) => ({
      ...theMedia,
      ...g,
      is_gallery: true,
      img_index: i + 2,
    }));
  }

  const { selectedMedia } = getSelectedMedia(media, theMedia, country, city);

  theMedia = selectedMedia;

  const { title, description } = getMetadata(theMedia, isBR);

  return defaultMetadata(
    title,
    description,
    theMedia,
    media[1] || theMedia.type === 'instagram-story'
  );
}

export default async function Country({ params: { country, city, media } }) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  const isWindows =
    new UAParser(headers().get('user-agent')).getOS().name === 'Windows';

  if (media.length > 2) {
    redirect(
      `/countries/${country}/cities/${city}/posts/${media[0]}/${media[1]}`
    );
  }

  const countryData = await getCountry(country, city);

  if (!countryData) {
    redirect('/');
  }

  let theCity = countryData.cities.find((c) => c.slug === city);

  if (!theCity) {
    redirect('/');
  }

  const db = getFirestore();
  const mediaRef = await db
    .collection('countries')
    .doc(country)
    .collection('medias')
    .doc(media[0].startsWith('story-') ? media[0] : 'media-' + media[0])
    .get();
  let theMedia = mediaRef.data();
  let galleryLength = 0;

  if (theMedia.gallery && theMedia.gallery.length) {
    theMedia.gallery = theMedia.gallery.map((g, i) => ({
      ...theMedia,
      ...g,
      is_gallery: true,
      img_index: i + 2,
    }));
    galleryLength = theMedia.gallery.length + 1;
  }

  const { mediaIndex, selectedMedia } = getSelectedMedia(
    media,
    theMedia,
    country,
    city
  );
  theMedia = selectedMedia;

  const description =
    (isBR && theMedia.description_pt
      ? theMedia.description_pt
      : theMedia.description) || '';
  const shortDescription =
    description.split(' ').length > 10
      ? description.split(' ').slice(0, 10).join(' ') + '…'
      : description;
  const location =
    theMedia.location_data &&
    theMedia.location_data
      .slice(0, 2)
      .map(
        (c) =>
          (isBR && c.name_pt ? c.name_pt : c.name) +
          (c.alternative_names
            ? ' (' + c.alternative_names.join(', ') + ')'
            : '')
      )
      .join(', ') + (theMedia.location_data.length > 2 ? '...' : '');

  const breadcrumbs = [
    {
      name: i18n(countryData.name),
      item: '/countries/' + country,
    },
    {
      name: isBR && theCity.name_pt ? theCity.name_pt : theCity.name,
      item: '/countries/' + country + '/cities/' + city,
    },
  ];

  if (theMedia.type === 'instagram-story') {
    breadcrumbs.push({
      name: i18n('Stories'),
      item: '/countries/' + country + '/cities/' + city + '/stories',
    });
  }

  let mediaId = null;

  if (theMedia.id.startsWith('story-')) {
    const split = theMedia.id.split('-');
    mediaId = split[split.length - 1];
  } else {
    mediaId = theMedia.id.replace('media-', '');
  }

  const basePath =
    '/countries/' +
    country +
    '/cities/' +
    city +
    (mediaId.length <= 3 ? '/stories/' : '/posts/') +
    mediaId;

  breadcrumbs.push({
    name: [shortDescription, location].filter((c) => c).join(' - '),
    item: basePath,
  });

  if (media[1]) {
    breadcrumbs.push({
      name: 'Item ' + media[1],
      item: basePath + '/' + media[1],
    });
  }

  const paginationBase = basePath + '/{page}';

  logAccess(
    db,
    host(
      '/' +
        city +
        (mediaId.length <= 3 ? '/stories/' : '/posts/') +
        mediaId +
        (media[1] ? '/' + media[1] : '')
    )
  );

  const header = (
    <>
      <h2
        className={isWindows ? 'windows-header' : null}
        style={{
          justifyContent:
            media[1] || theMedia.type === 'instagram-story' ? 'center' : null,
        }}
      >
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
    </>
  );

  return (
    <div className="container">
      <div className="media_navigation">
        <Link
          href={
            '/countries/' +
            country +
            '/cities/' +
            city +
            (theMedia.type === 'instagram-story' ? '/stories' : '') +
            (mediaIndex ? '/posts/' + theMedia.id.replace('media-', '') : '')
          }
          id="back-button"
          scroll={false}
          prefetch={false}
        >
          <img src="/images/back.svg" alt={i18n('Back')} width="32px"></img>
        </Link>

        <ShareButton />
      </div>

      {!media[1] && theMedia.type !== 'instagram-story' && <div>{header}</div>}

      <div
        className={styles.media}
        style={{
          marginTop:
            media[1] || theMedia.type === 'instagram-story' ? 14 : null,
        }}
      >
        <InstagramMedia
          media={theMedia}
          isBR={isBR}
          withoutLink={media[1] || theMedia.type === 'instagram-story'}
          expandGalleries
          fullQuality
          isMain
        />

        {media[1] && galleryLength > 0 && (
          <div style={{ marginTop: 24 }}>
            <Pagination
              base={paginationBase}
              currentPage={Number(media[1]) || 1}
              pageNumber={galleryLength}
              isGallery
              total={5}
            />
          </div>
        )}

        {theMedia.gallery &&
          theMedia.gallery.length > 0 &&
          theMedia.gallery.map((g) => (
            <div key={g.file} style={{ marginTop: 16 }}>
              <InstagramMedia
                key={g.file}
                media={g}
                isBR={isBR}
                expandGalleries
                fullQuality
                isListing
              />
            </div>
          ))}
      </div>

      {(media[1] || theMedia.type === 'instagram-story') && (
        <div style={{ textAlign: 'center' }}>{header}</div>
      )}

      <StructuredBreadcrumbs breadcrumbs={breadcrumbs} />

      <Script src="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.11.6/viewer.min.js"></Script>
    </div>
  );
}
