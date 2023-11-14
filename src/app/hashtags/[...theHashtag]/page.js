import useI18n from '../../hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import { getFirestore } from 'firebase-admin/firestore';
import styles from './page.module.css';
import { FILE_DOMAIN, FILE_DOMAIN_500, SITE_NAME } from '@/app/utils/constants';
import Scroller from '@/app/components/scroller';

export async function generateMetadata({ params: { theHashtag } }) {
  const title = '#' + decodeURIComponent(theHashtag[0]) + ' - Hashtags' + ' - ' + SITE_NAME;

  return {
    title,
    openGraph: {
      title,
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

      if (expandGalleries && data.gallery) {
        photos = [...photos, ...data.gallery.map((g, i) => ({ ...data, ...g, img_index: i + 2 }))];
      }
    });

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

  const sortPicker = (type) => (<div className="container-fluid">
    <div className={ styles.sort_picker }>
      <span>{i18n('Sorting')}:</span>

      {[{name: 'Latest', value: 'desc'}, {name: 'Oldest', value: 'asc'}, {name: 'Random', value: 'random'}].map((o) => <Link key={o} href={ '?sort=' + o.value } scroll={false}><label><input type="radio" name={'sort-' + type } value={o.value} checked={sort === o.value} readOnly />{i18n(o.name)}</label></Link>)}
    </div>
  </div>);

  let instagramPhotos = photos.filter(p => p.type === 'instagram' || p.type === 'instagram-gallery');
  const shortVideos = photos.filter(p => p.type === 'short-video');
  const youtubeVideos = photos.filter(p => p.type === 'youtube');

  if (expandGalleries) {
    let expandedList = [];

    instagramPhotos.forEach((item) => {
      expandedList = [...expandedList, item];

      if (item.gallery && item.gallery.length) {
        expandedList = [...expandedList, ...item.gallery.map((g, i) => ({ ...item, ...g, img_index: i + 2 }))];
      }
    });
    
    instagramPhotos = expandedList;
  }

  return <div>
    <div className="container-fluid">
      <h3>#{decodeURIComponent(hashtag)}</h3>
    </div>

    <div className={ styles.galleries }>
      { shortVideos.length > 1 && sortPicker('short') }

      { shortVideos.length > 0 && <Scroller title="Short Videos" items={shortVideos} isShortVideos /> }

      { youtubeVideos.length > 1 && sortPicker('youtube') }

      { youtubeVideos.length > 0 && <Scroller title="YouTube Videos" items={youtubeVideos} isYouTubeVideos /> }

      { instagramPhotos.length > 1 && sortPicker('photos') }

      { instagramPhotos.length > 0 && <div className="container-fluid">
        <div className={ styles.instagram_photos }>
          <div className={ styles.instagram_photos_title }>
            <h4>{i18n('Instagram Photos')}</h4>
            { !expandGalleries ? <Link href={ `/hashtags/${hashtag}/expand` + (sort !== 'desc' ? '?sort=' + sort : '')} scroll={false} prefetch={false}>{i18n('Expand Galleries')}</Link> : <Link href={ `/hashtags/${hashtag}` + (sort !== 'desc' ? '?sort=' + sort : '')} scroll={false} prefetch={false}>{i18n('Minimize Galleries')}</Link> }
          </div>
          
          <div className={ styles.instagram_highlights_items }>
            {instagramPhotos.map(p => <div key={ p.file } className={ styles.gallery_item + (p.gallery && p.gallery.length && ! expandGalleries ? ' ' + styles.is_gallery : '' ) }>
              <a href={p.link + (p.img_index ? '?img_index=' + p.img_index : '')} target="_blank">
                {p.file_type === 'video' ? <video src={FILE_DOMAIN + p.file + '#t=0.1'} controls /> : <img src={FILE_DOMAIN + p.file} srcSet={ `${FILE_DOMAIN_500 + p.file} 500w` } alt={isBR ? p.description_pt : p.description} loading="lazy" />}
              </a>

              <div className={ styles.item_description }>
                {isBR ? p.description_pt : p.description}
              </div>

              {!p.file_type && <div className={ styles.item_hashtags }>
                Hashtags: {p.hashtags.reverse().map(h => <><Link href={`/hashtags/${h}`} key={h} prefetch={false}>#{h}</Link> </>)}
              </div>}
            </div>)}
          </div>
        </div>
      </div>}
    </div>
  </div>
}
