import useI18n from '../../hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import styles from './page.module.css';
import { SITE_NAME } from '@/app/utils/constants';
import Scroller from '@/app/components/scroller';
import { redirect } from 'next/dist/server/api-utils';
import InstagramMedia from '@/app/components/instagram-media';
import ShareButton from '@/app/components/share-button';
import randomIntFromInterval from '@/app/utils/random-int';

export async function generateMetadata({ params: { theHashtag } }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();
  
  const hashtag = decodeURIComponent(theHashtag[0]);
  const title = '#' + hashtag + ' - Hashtags' + ' - ' + SITE_NAME;
  const description = i18n('Photos and videos taken by Viajar com Alê with the hashtag #:hashtag:.', {
    hashtag,
  });

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

export default async function Country({ params: { theHashtag }, searchParams }) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  const [queryHashtag, expand] = theHashtag;
  const hashtag = decodeURIComponent(queryHashtag);

  const expandGalleries = expand;
  let sort = searchParams.sort && ['asc', 'desc', 'random'].includes(searchParams.sort) && searchParams.sort || 'desc';

  const cacheRef = `/caches/hashtags/hashtags/${hashtag}/sort/${sort === 'asc' ? 'asc' : 'desc'}`;

  const db = getFirestore();
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
      redirect('/');
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

  db.collection('accesses').doc((new Date()).toISOString().split('T')[0]).set({
    [host('/hashtags/') + hashtag + ('?sort=' + sort)]: FieldValue.increment(1),
  }, {merge:true});

  let newShuffle = randomIntFromInterval(1, 15);

  if (newShuffle == searchParams.shuffle) {
    newShuffle = randomIntFromInterval(1, 15);
  }

  const sortPicker = (type) => (<div className="container-fluid">
    <div className={ styles.sort_picker }>
      <span>{i18n('Sorting')}:</span>

      {[{name: 'Latest', value: 'desc'}, {name: 'Oldest', value: 'asc'}, {name: 'Random', value: 'random'}].map((o) => <Link key={o} href={ o.value === 'random' ? sort === 'random' ? '/hashtags/' + hashtag : '/hashtags/' + hashtag + '?sort=random&shuffle=' + newShuffle : o.value !== 'desc' ? '?sort=' + o.value : '/hashtags/' + hashtag } scroll={false} prefetch={false}><label><input type="radio" name={'sort-' + type } value={o.value} checked={sort === o.value} readOnly />{i18n(o.name)}</label></Link>)}
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
        <Link href="/" id="back-button" className={ styles.history_back_button } scroll={false}>
          <img src="/images/back.svg" alt="Back Button" width="30px"></img>
        </Link>

        <ShareButton />
      </div>
    </div>
    
    <div className="container-fluid">
      <h2>#{decodeURIComponent(hashtag)}</h2>
    </div>

    <div className={ styles.galleries }>
      { shortVideos.length > 1 && sortPicker('short') }

      { shortVideos.length > 0 && <Scroller title={i18n('Short Video')} items={shortVideos} isShortVideos /> }

      { youtubeVideos.length > 1 && sortPicker('youtube') }

      { youtubeVideos.length > 0 && <Scroller title={i18n('YouTube Videos')} items={youtubeVideos} isYouTubeVideos /> }

      { _360photos.length > 1 && sortPicker('360photos') }

      { _360photos.length > 0 && <Scroller title={i18n('360 Photos')} items={_360photos} is360Photos /> }

      { instagramStories.length > 1 && sortPicker('stories') }

      { instagramStories.length > 0 && <Scroller title="Stories" items={instagramStories} isStories /> }

      { instagramPhotos.filter(p => !p.file_type).length > 1 && sortPicker('photos') }

      { instagramPhotos.filter(p => !p.file_type).length > 0 && <div className="container-fluid">
        <div className={ styles.instagram_photos }>
          <div className={ styles.instagram_photos_title }>
            <h3>{i18n('Posts')}</h3>
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
