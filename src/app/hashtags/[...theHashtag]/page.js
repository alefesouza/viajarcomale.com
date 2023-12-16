import useI18n from '../../hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import { getFirestore } from 'firebase-admin/firestore';
import styles from './page.module.css';
import { FILE_DOMAIN, FILE_DOMAIN_SQUARE, SITE_NAME } from '@/app/utils/constants';
import Scroller from '@/app/components/scroller';
import { redirect } from 'next/navigation';
import InstagramMedia from '@/app/components/instagram-media';
import ShareButton from '@/app/components/share-button';
import randomIntFromInterval from '@/app/utils/random-int';
import WebStories from '@/app/components/webstories';
import removeDiacritics from '@/app/utils/remove-diacritics';
import logAccess from '@/app/utils/log-access';

export async function generateMetadata({ params: { theHashtag } }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  const isWebStories = theHashtag[1] === 'webstories';

  const hashtag = removeDiacritics(decodeURIComponent(theHashtag[0]));
  
  if (theHashtag.length > 2 || (theHashtag[1] && theHashtag[1] !== 'expand' && theHashtag[1] !== 'webstories')) {
    redirect(`/hashtags/${hashtag}`);
  }

  const title = '#' + hashtag + ' - Hashtags' + ' - ' + (isWebStories ? 'Web Stories - ' : '') + SITE_NAME;
  const description = i18n('Photos and videos taken by Viajar com Alê with the hashtag #:hashtag:.', {
    hashtag,
  });

  const db = getFirestore();
  const hashtagPtSnapshot = await db.collection('hashtags').where('name_pt', '==', hashtag).get();
  let hashtagPt = null;
  let hashtagEn = null;

  hashtagPtSnapshot.forEach(doc => {
    hashtagPt = doc.data();
  });

  if (!hashtagPt) {
    const hashtagEnDoc = await db.collection('hashtags').doc(hashtag).get();
    hashtagEn = hashtagEnDoc.data();
  }

  if (!hashtagPt && !hashtagEn) {
    redirect('/hashtags');
  }

  const finalHashtag = hashtagPt || hashtagEn;

  const enUrl = 'https://viajarcomale.com' + (isWebStories ? '/webstories' : '') + '/hashtags/' + finalHashtag.name;
  const ptUrl = 'https://viajarcomale.com.br' + (isWebStories ? '/webstories' : '') + '/hashtags/' + (finalHashtag.name_pt ? finalHashtag.name_pt : finalHashtag.name);

  const coverSnapshot = await db.collectionGroup('medias').where('hashtags', 'array-contains', finalHashtag.name).orderBy('date', 'desc').limit(2).get();

  let cover = null;

  coverSnapshot.forEach((photo) => {
    const data = photo.data();

    if (data.type !== 'instagram' || !cover) {
      cover = data;
    }
  });

  if (!cover) {
    redirect('/hashtags');
  }

  let image = FILE_DOMAIN + cover.file.replace('.mp4', '-thumb.png');

  if (cover.type === 'instagram-story') {
    image = FILE_DOMAIN_SQUARE + cover.file.replace('.mp4', '-thumb.png');
  }

  const images = [{
    url: image,
    width: cover.width,
    height: cover.type === 'instagram-story' ? cover.width : cover.height,
    type: cover.file.includes('.png') ? 'image/png' : 'image/jpeg',
  }];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
    },
    twitter: {
      title,
      description,
      images,
    },
    other: {
      title,
      image,
    },
    alternates: {
      canonical: isBR ? ptUrl : enUrl,
      languages: {
        'x-default': enUrl,
        'en': enUrl,
        'pt': ptUrl,
      },
    },
    ...finalHashtag?.totals?.stories > 0 && !isWebStories ? {
    icons: {
      // Why Next.js doesn't just allow us to create custom <link> tags directly...
      other: {
        rel: 'amphtml',
        url: host('/webstories/hashtags/' + hashtag),
      },
    } } : null,
  }
}

export default async function Country({ params: { theHashtag }, searchParams }) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  const [queryHashtag, expand] = theHashtag;
  let hashtag = removeDiacritics(decodeURIComponent(queryHashtag));

  const db = getFirestore();
  const hashtagPtSnapshot = await db.collection('hashtags').where('name_pt', '==', hashtag).get();
  let hashtagPt = null;

  hashtagPtSnapshot.forEach(doc => {
    hashtagPt = doc.data();
  });

  if (hashtagPt) {
    hashtag = hashtagPt.name;
  }

  const expandGalleries = expand;
  let sort = searchParams.sort && ['asc', 'desc', 'random'].includes(searchParams.sort) && searchParams.sort || 'desc';

  if (!searchParams.sort && expand === 'webstories') {
    sort = 'asc';
  }

  const cacheRef = `/caches/hashtags/hashtags/${hashtag}/sort/${sort === 'asc' ? 'asc' : 'desc'}`;

  const cache = await db.doc(cacheRef).get();

  let isRandom = sort === 'random';

  if (isRandom) {
    sort = 'desc';
  }

  let photos = [];

  if (!cache.exists) {
    const photosSnapshot = await db.collectionGroup('medias').where('hashtags', 'array-contains', hashtag).orderBy('order', sort).get();

    photosSnapshot.forEach((photo) => {
      const data = photo.data();

      photos = [...photos, data];
    });

    if (!photos.length) {
      redirect('/hashtags');
    }

    if (!isRandom && !cache.exists) {
      db.doc(cacheRef).set({
        photos,
        last_update: (new Date().toISOString()).split('T')[0],
      });
    }
  } else {
    photos = cache.data().photos;
  }

  if (isRandom) {
    photos = photos.map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
      sort = 'random';
  }

  const isWebStories = theHashtag[1] === 'webstories';
  logAccess(db, host((isWebStories ? '/webstories' : '') + '/hashtags/') + decodeURIComponent(queryHashtag) + ('?sort=' + sort));

  let newShuffle = randomIntFromInterval(1, 15);

  if (newShuffle == searchParams.shuffle) {
    newShuffle = randomIntFromInterval(1, 15);
  }

  const sortPicker = (type) => (<div className="container-fluid">
    <div className={ styles.sort_picker }>
      <span>{i18n('Sorting')}:</span>

      {[{name: 'Latest', value: 'desc'}, {name: 'Oldest', value: 'asc'}, {name: 'Random', value: 'random'}].map((o) => <Link key={o} href={ o.value === 'random' ? sort === 'random' ? '/hashtags/' + hashtag : '/hashtags/' + hashtag + '?sort=random&shuffle=' + newShuffle : o.value !== 'desc' ? '?sort=' + o.value : '/hashtags/' + hashtag } scroll={false}><label><input type="radio" name={'sort-' + type } value={o.value} checked={sort === o.value} readOnly />{i18n(o.name)}</label></Link>)}
    </div>
  </div>);

  let instagramPhotos = photos.filter(p => p.type === 'instagram' || p.type === 'instagram-gallery');
  const instagramStories = photos.filter(p => p.type === 'instagram-story');
  const shortVideos = photos.filter(p => p.type === 'short-video');
  const youtubeVideos = photos.filter(p => p.type === 'youtube');
  const _360photos = photos.filter(p => p.type === '360photo');

  if (sort == 'desc') {
    instagramStories.sort(function(a,b){
      return new Date(b.date) - new Date(a.date);
    });
  } else if (sort == 'asc') {
    instagramStories.sort(function(a,b){
      return new Date(a.date) - new Date(b.date);
    });
  }

  if (expand == 'webstories') {
    return <WebStories title={`#${hashtagPt ? hashtagPt.name_pt : hashtag} - Hashtags`} storyTitle={`#${hashtagPt ? hashtagPt.name_pt : hashtag}`} items={instagramStories} />
  }

  let expandedList = [];

  instagramPhotos.forEach((item) => {
    expandedList = [...expandedList, item];

    if (item.gallery && item.gallery.length) {
      const gallery = item.gallery.map((g, i) => ({ ...item, ...g, is_gallery: true, img_index: i + 2 }));
      const itemWithHashtag = gallery.findIndex(g => g.item_hashtags && g.item_hashtags.includes(hashtag));

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

  return <div>
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Link href="/hashtags" id="back-button" className={ styles.history_back_button } scroll={false}>
          <img src="/images/back.svg" alt={i18n('Back')} width="32px"></img>
        </Link>

        <ShareButton />
      </div>
    </div>
    
    <div className="container-fluid">
      <h2>#{decodeURIComponent(hashtagPt ? hashtagPt.name_pt : hashtag)}</h2>
    </div>

    <div className={ styles.galleries }>
      { shortVideos.length > 1 && sortPicker('short') }

      { shortVideos.length > 0 && <Scroller title={i18n('Short Videos')} items={shortVideos} isShortVideos /> }

      { youtubeVideos.length > 1 && sortPicker('youtube') }

      { youtubeVideos.length > 0 && <Scroller title={i18n('YouTube Videos')} items={youtubeVideos} isYouTubeVideos /> }

      { _360photos.length > 1 && sortPicker('360photos') }

      { _360photos.length > 0 && <Scroller title={i18n('360 Photos')} items={_360photos} is360Photos /> }

      { instagramStories.length > 1 && sortPicker('stories') }

      { instagramStories.length > 0 && <Scroller title="Stories" items={instagramStories} isStories webStoriesHref={host('/webstories/hashtags/' + hashtag)} /> }

      { instagramPhotos.filter(p => !p.file_type).length > 1 && sortPicker('photos') }

      { instagramPhotos.filter(p => !p.file_type).length > 0 && <div className="container-fluid">
        <div className={ styles.instagram_photos }>
          <div className={ styles.instagram_photos_title }>
            <h3>{i18n('Posts')}</h3>
          </div>

          <div className="center_link">
            { !expandGalleries ? <Link href={ `/hashtags/${hashtag}/expand` + (sort !== 'desc' ? '?sort=' + sort : '')} scroll={false} prefetch={false}>{i18n('Expand Galleries')}</Link> : <Link href={ `/hashtags/${hashtag}` + (sort !== 'desc' ? '?sort=' + sort : '')} scroll={false} prefetch={false}>{i18n('Minimize Galleries')}</Link> }
          </div>
          
          <div className={ styles.instagram_highlights_items }>
            {instagramPhotos.map(p => <InstagramMedia key={p.id} media={p} isBR={isBR} expandGalleries={expandGalleries} isListing />)}
          </div>
        </div>
      </div>}
    </div>
  </div>
}
