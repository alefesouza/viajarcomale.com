import useI18n from '../../hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import { getFirestore } from 'firebase-admin/firestore';
import styles from './page.module.css';
import { SITE_NAME } from '@/app/utils/constants';
import Scroller from '@/app/components/scroller';
import { permanentRedirect, redirect } from 'next/navigation';
import InstagramMedia from '@/app/components/instagram-media';
import ShareButton from '@/app/components/share-button';
import randomIntFromInterval from '@/app/utils/random-int';
import WebStories from '@/app/components/webstories';
import removeDiacritics from '@/app/utils/remove-diacritics';
import logAccess from '@/app/utils/log-access';
import getSort from '@/app/utils/get-sort';
import StructuredBreadcrumbs from '@/app/components/structured-breadcrumbs';
import defaultMetadata from '@/app/utils/default-metadata';
import { headers } from 'next/headers';

export async function generateMetadata({
  params: { theHashtag },
  searchParams,
}) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  const isWebStories = theHashtag[1] === 'webstories';

  const hashtag = removeDiacritics(decodeURIComponent(theHashtag[0]));

  if (
    theHashtag.length > 2 ||
    (theHashtag[1] &&
      theHashtag[1] !== 'expand' &&
      theHashtag[1] !== 'webstories')
  ) {
    redirect(`/hashtags/${hashtag}`);
  }

  const title = [
    '#' + hashtag,
    'Hashtags',
    isWebStories ? 'Web Stories' : '',
    SITE_NAME,
  ]
    .filter((c) => c)
    .join(' - ');
  const description = i18n(
    'Photos and videos taken by Viajar com Alê with the hashtag #:hashtag:.',
    {
      hashtag,
    }
  );

  const db = getFirestore();
  const hashtagPtSnapshot = await db
    .collection('hashtags')
    .where('name_pt', '==', hashtag)
    .get();
  let hashtagPt = null;
  let hashtagEn = null;

  hashtagPtSnapshot.forEach((doc) => {
    hashtagPt = doc.data();
  });

  if (!hashtagPt) {
    const hashtagEnDoc = await db.collection('hashtags').doc(hashtag).get();
    hashtagEn = hashtagEnDoc.data();
  }

  if (!hashtagPt && !hashtagEn) {
    const hashtagAlternateDoc = await db
      .collection('hashtags')
      .where('alternate_tags', 'array-contains', hashtag)
      .get();
    let hashtagAlternate = null;

    hashtagAlternateDoc.forEach((doc) => {
      hashtagAlternate = doc.data();
    });

    if (hashtagAlternate) {
      permanentRedirect(
        (headers().get('x-pathname').includes('/webstories')
          ? '/webstories'
          : '') +
          '/hashtags/' +
          (isBR && hashtagAlternate.name_pt
            ? hashtagAlternate.name_pt
            : hashtagAlternate.name)
      );
    } else {
      redirect('/hashtags');
    }
  }

  const finalHashtag = hashtagPt || hashtagEn;

  if (finalHashtag.is_country && finalHashtag?.metadata?.country_slug) {
    permanentRedirect('/countries/' + finalHashtag.metadata.country_slug);
  }

  if (finalHashtag.is_city && finalHashtag?.metadata?.city_slug) {
    permanentRedirect(
      '/countries/' +
        finalHashtag.metadata.country_slug +
        '/cities/' +
        finalHashtag.metadata.city_slug
    );
  }

  const enUrl =
    'https://viajarcomale.com' +
    (isWebStories ? '/webstories' : '') +
    '/hashtags/' +
    finalHashtag.name;
  const ptUrl =
    'https://viajarcomale.com.br' +
    (isWebStories ? '/webstories' : '') +
    '/hashtags/' +
    (finalHashtag.name_pt ? finalHashtag.name_pt : finalHashtag.name);

  const sort = getSort(searchParams, theHashtag[1] === 'webstories', false);
  let coverSnapshot = await db
    .collectionGroup('medias')
    .where('highlight_hashtags', 'array-contains', finalHashtag.name)
    .limit(1)
    .get();

  if (coverSnapshot.size === 0) {
    coverSnapshot = db
      .collectionGroup('medias')
      .where('hashtags', 'array-contains', finalHashtag.name);

    if (isWebStories) {
      coverSnapshot = coverSnapshot.where('type', '==', 'story');
    }

    coverSnapshot = await coverSnapshot
      .orderBy('date', sort)
      .limit(isWebStories ? 1 : 2)
      .get();
  }

  let cover = null;

  coverSnapshot.forEach((photo) => {
    const data = photo.data();

    if ((cover && cover.type === 'post') || !cover) {
      cover = data;
    }
  });

  if (!cover) {
    redirect('/hashtags');
  }

  const defaultMeta = defaultMetadata(title, description, cover);

  return {
    ...defaultMeta,
    openGraph: {
      ...defaultMeta.openGraph,
      url: isBR ? ptUrl : enUrl,
    },
    alternates: {
      canonical: isBR ? ptUrl : enUrl,
      languages: {
        'x-default': enUrl,
        en: enUrl,
        pt: ptUrl,
      },
    },
    ...(finalHashtag?.totals?.stories > 0 && !isWebStories
      ? {
          icons: {
            // Why Next.js doesn't just allow us to create custom <link> tags directly...
            other: {
              rel: 'amphtml',
              url: host('/webstories/hashtags/' + hashtag),
            },
          },
        }
      : null),
  };
}

export default async function Country({
  params: { theHashtag },
  searchParams,
}) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  const [queryHashtag, expand] = theHashtag;
  let hashtag = removeDiacritics(decodeURIComponent(queryHashtag));

  const db = getFirestore();
  const hashtagPtSnapshot = await db
    .collection('hashtags')
    .where('name_pt', '==', hashtag)
    .get();
  let hashtagPt = null;

  hashtagPtSnapshot.forEach((doc) => {
    hashtagPt = doc.data();
  });

  if (hashtagPt) {
    hashtag = hashtagPt.name;
  }

  const expandGalleries = expand;
  let sort = getSort(searchParams, expand === 'webstories');

  const cacheRef = `/caches/hashtags/hashtags/${hashtag}/sort/${
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
      .collectionGroup('medias')
      .where('hashtags', 'array-contains', hashtag)
      .orderBy('order', sort)
      .get();

    photosSnapshot.forEach((photo) => {
      const data = photo.data();

      photos = [...photos, data];
    });

    if (!photos.length) {
      const hashtagAlternateDoc = await db
        .collection('hashtags')
        .where('alternate_tags', 'array-contains', hashtag)
        .get();
      let hashtagAlternate = null;

      hashtagAlternateDoc.forEach((doc) => {
        hashtagAlternate = doc.data();
      });

      if (hashtagAlternate) {
        permanentRedirect(
          '/hashtags/' +
            (isBR && hashtagAlternate.name_pt
              ? hashtagAlternate.name_pt
              : hashtagAlternate.name)
        );
      } else {
        redirect('/hashtags');
      }
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

  const isWebStories = theHashtag[1] === 'webstories';
  logAccess(
    db,
    host((isWebStories ? '/webstories' : '') + '/hashtags/') +
      decodeURIComponent(queryHashtag) +
      ('?sort=' + sort)
  );

  let newShuffle = randomIntFromInterval(1, 15);

  if (newShuffle == searchParams.shuffle) {
    newShuffle = randomIntFromInterval(1, 15);
  }

  let instagramPhotos = photos.filter(
    (p) => p.type === 'post' || p.type === 'post-gallery'
  );
  const instagramStories = photos.filter((p) => p.type === 'story');
  const shortVideos = photos.filter((p) => p.type === 'short-video');
  const youtubeVideos = photos.filter((p) => p.type === 'youtube');
  const _360photos = photos.filter((p) => p.type === '360photo');

  if (sort == 'desc') {
    instagramStories.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });
  } else if (sort == 'asc') {
    instagramStories.sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });
  }

  if (expand == 'webstories') {
    return (
      <WebStories
        title={`#${hashtagPt ? hashtagPt.name_pt : hashtag}`}
        storyTitle={`#${hashtagPt ? hashtagPt.name_pt : hashtag}`}
        items={instagramStories}
        hashtag={hashtagPt ? hashtagPt.name_pt : hashtag}
      />
    );
  }

  let expandedList = [];

  instagramPhotos.forEach((item) => {
    expandedList = [...expandedList, item];

    if (item.gallery && item.gallery.length) {
      const gallery = item.gallery.map((g, i) => ({
        ...item,
        ...g,
        is_gallery: true,
        img_index: i + 2,
      }));
      const itemWithHashtag = gallery.findIndex(
        (g) => g.item_hashtags && g.item_hashtags.includes(hashtag)
      );

      if (itemWithHashtag > -1) {
        delete gallery[itemWithHashtag].is_gallery;
        expandedList[expandedList.length - 1] = gallery[itemWithHashtag];

        item.file_type = 'image';
        gallery[itemWithHashtag] = item;
      }

      if (expandGalleries) {
        expandedList = [...expandedList, ...gallery];
      }
    }
  });

  instagramPhotos = expandedList;

  const currentHashtag = decodeURIComponent(
    hashtagPt ? hashtagPt.name_pt : hashtag
  );

  const breadcrumbs = [
    {
      name: 'Hashtags',
      item: '/hashtags',
    },
    {
      name: `#${currentHashtag}`,
      item: '/hashtags/' + currentHashtag,
    },
  ];

  if (expandGalleries) {
    breadcrumbs.push({
      name: i18n('Expand Galleries'),
      item: '/hashtags/' + currentHashtag + '/expand',
    });
  }

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
                  ? '/hashtags/' + currentHashtag
                  : '/hashtags/' +
                    currentHashtag +
                    '?sort=random&shuffle=' +
                    newShuffle
                : o.value !== 'desc'
                ? '?sort=' + o.value
                : '/hashtags/' + currentHashtag
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
            href="/hashtags"
            id="back-button"
            className={styles.history_back_button}
            scroll={false}
          >
            <img src="/images/back.svg" alt={i18n('Back')} width="32px"></img>
          </Link>

          <ShareButton />
        </div>
      </div>

      <div className="container-fluid">
        <h2>#{currentHashtag}</h2>
      </div>

      <div className={styles.galleries}>
        {shortVideos.length > 1 && sortPicker('short')}

        {shortVideos.length > 0 && (
          <Scroller
            title={i18n('Short Videos')}
            items={shortVideos}
            isShortVideos
          />
        )}

        {youtubeVideos.length > 1 && sortPicker('youtube')}

        {youtubeVideos.length > 0 && (
          <Scroller
            title={i18n('YouTube Videos')}
            items={youtubeVideos}
            isYouTubeVideos
          />
        )}

        {_360photos.length > 1 && sortPicker('360photos')}

        {_360photos.length > 0 && (
          <Scroller title={i18n('360 Photos')} items={_360photos} is360Photos />
        )}

        {instagramStories.length > 1 && sortPicker('stories')}

        {instagramStories.length > 0 && (
          <Scroller
            title="Stories"
            items={instagramStories}
            isStories
            webStoriesHref={host('/webstories/hashtags/' + currentHashtag)}
            sort={sort}
          />
        )}

        {instagramPhotos.filter((p) => !p.file_type).length > 1 &&
          sortPicker('photos')}

        {instagramPhotos.filter((p) => !p.file_type).length > 0 && (
          <div className="container-fluid">
            <div className={styles.instagram_photos}>
              <div className={styles.instagram_photos_title}>
                <h3>{i18n('Posts')}</h3>
              </div>

              <div className="center_link">
                {!expandGalleries ? (
                  <Link
                    href={
                      `/hashtags/${currentHashtag}/expand` +
                      (sort !== 'desc' ? '?sort=' + sort : '')
                    }
                    scroll={false}
                    prefetch={false}
                  >
                    {i18n('Expand Galleries')}
                  </Link>
                ) : (
                  <Link
                    href={
                      `/hashtags/${currentHashtag}` +
                      (sort !== 'desc' ? '?sort=' + sort : '')
                    }
                    scroll={false}
                    prefetch={false}
                  >
                    {i18n('Minimize Galleries')}
                  </Link>
                )}
              </div>

              <div className={styles.instagram_highlights_items}>
                {instagramPhotos.map((p) => (
                  <InstagramMedia
                    key={p.id}
                    media={p}
                    isBR={isBR}
                    expandGalleries={expandGalleries}
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
