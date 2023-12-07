import useI18n from '@/app/hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import styles from './page.module.css';
import { SITE_NAME } from '@/app/utils/constants';
import Scroller from '@/app/components/scroller';
import { redirect } from 'next/navigation';
import InstagramMedia from '@/app/components/instagram-media';
import ShareButton from '@/app/components/share-button';
import randomIntFromInterval from '@/app/utils/random-int';
import WebStories from '@/app/components/webstories';

async function getCountry(country, city) {
  const db = getFirestore();
  const countryDoc = await db.collection('countries').doc(country).get();
  const countryData = countryDoc.data();

  if (city && !countryData.cities.find(c => c.slug === city)) {
    return false;
  }
  
  return countryData;
}

export async function generateMetadata({ params: { country, city, theLocation } }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  const isWebStories = theLocation[1] === 'webstories';

  if (theLocation.length > 2 || (theLocation[1] && theLocation[1] !== 'expand' && theLocation[1] !== 'webstories')) {
    redirect(`/countries/${country}/cities/${city}/locations/${theLocation[0]}`);
  }

  const countryData = await getCountry(country, city);

  if (!countryData) {
    redirect('/');
  }

  let theCity = null;

  if (city) {
    theCity = countryData.cities.find(c => c.slug === city);
  }

  if (!theCity) {
    redirect('/');
  }

  const location = decodeURIComponent(theLocation[0]);

  const db = getFirestore();
  const mediaRef = await db.collection('countries').doc(country).collection('locations').doc(location).get();
  const theMedia = mediaRef.data();

  const finalLocation = (theCity ? isBR && theCity.name_pt ? theCity.name_pt + ' - ' : theCity.name + ' - ' : '') + i18n(countryData.name);
  const title = theMedia.name + ' - ' + finalLocation + ' - ' + (isWebStories ? ' Web Stories - ' : '') + SITE_NAME;
  const description = i18n('Photos and videos taken by Viajar com Alê in :location:', {
    location: theMedia.name,
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
    ...theMedia?.totals?.stories > 0 ? {
    icons: {
      // Why Next.js doesn't just allow us to create custom <link> tags directly...
      other: {
        rel: 'amphtml',
        url: host('/webstories/countries/' + country + '/cities/' + city + '/locations/' + location),
      },
    } } : null,
  }
}

export default async function Country({ params: { country, city, theLocation }, searchParams }) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  const [queryLocation, expand] = theLocation;
  const location = decodeURIComponent(queryLocation);

  const expandGalleries = expand;
  let sort = searchParams.sort && ['asc', 'desc', 'random'].includes(searchParams.sort) && searchParams.sort || 'desc';

  if (!searchParams.sort && expand === 'webstories') {
    sort = 'asc';
  }

  const countryData = await getCountry(country, city);

  if (!countryData) {
    redirect('/');
  }

  let theCity = countryData.cities.find(c => c.slug === city);

  const cacheRef = `/caches/locations/locations/${location}/sort/${sort === 'asc' ? 'asc' : 'desc'}`;

  const db = getFirestore();
  const cache = await db.doc(cacheRef).get();

  let isRandom = sort === 'random';

  if (isRandom) {
    sort = 'desc';
  }

  let photos = [];

  const mediaRef = await db.collection('countries').doc(country).collection('locations').doc(location).get();
  let theMedia = mediaRef.data();

  if (!cache.exists) {
    const photosSnapshot = await db.collection('countries').doc(country).collection('medias').where('locations', 'array-contains', location).orderBy('order', sort).get();

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
    [host('/locations/') + location + ('?sort=' + sort)]: FieldValue.increment(1),
  }, {merge:true});

  let newShuffle = randomIntFromInterval(1, 15);

  if (newShuffle == searchParams.shuffle) {
    newShuffle = randomIntFromInterval(1, 15);
  }

  const basePath = `/countries/${country}/cities/${city}/locations/${location}`;

  const sortPicker = (type) => (<div className="container-fluid">
    <div className={ styles.sort_picker }>
      <span>{i18n('Sorting')}:</span>

      {[{name: 'Latest', value: 'desc'}, {name: 'Oldest', value: 'asc'}, {name: 'Random', value: 'random'}].map((o) => <Link key={o} href={ o.value === 'random' ? sort === 'random' ? basePath : basePath + '?sort=random&shuffle=' + newShuffle : o.value !== 'desc' ? '?sort=' + o.value : basePath } scroll={false}><label><input type="radio" name={'sort-' + type } value={o.value} checked={sort === o.value} readOnly />{i18n(o.name)}</label></Link>)}
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
    const finalLocation = (theCity ? isBR && theCity.name_pt ? theCity.name_pt + ' - ' : theCity.name + ' - ' : '') + i18n(countryData.name);
    const title = theMedia.name + ' - ' + finalLocation;
    
    return <WebStories title={title} storyTitle={theMedia.name} items={instagramStories} webStoriesHref={host('/webstories/countries/' + country + '/cities/' + city + '/locations/' + location)} />
  }

  let expandedList = [];

  instagramPhotos.forEach((item) => {
    expandedList = [...expandedList, item];

    if (item.gallery && item.gallery.length) {
      const gallery = item.gallery.map((g, i) => ({ ...item, ...g, is_gallery: true, img_index: i + 2 }));
      const itemWithLocation = gallery.findIndex(g => g.item_locations && g.item_locations.includes(location));

      if (itemWithLocation > -1) {
        delete gallery[itemWithLocation].is_gallery;
        expandedList[expandedList.length - 1] = gallery[itemWithLocation];

        item.file_type = 'image';
        gallery[itemWithLocation] = item;
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
          <img src="/images/back.svg" alt={i18n('Back')} width="30px"></img>
        </Link>

        <ShareButton />
      </div>
    </div>
    
    <div className="container-fluid">
      <h2>{theMedia.name}{theMedia.alternative_names && ' (' + theMedia.alternative_names.join(', ') + ')'} - {isBR && theCity.name_pt ? theCity.name_pt : theCity.name} - {i18n(countryData.name)} {countryData.flag}</h2>
    </div>

    <div className={ styles.galleries }>
      { shortVideos.length > 1 && sortPicker('short') }

      { shortVideos.length > 0 && <Scroller title={i18n('Short Videos')} items={shortVideos} isShortVideos /> }

      { youtubeVideos.length > 1 && sortPicker('youtube') }

      { youtubeVideos.length > 0 && <Scroller title={i18n('YouTube Videos')} items={youtubeVideos} isYouTubeVideos /> }

      { _360photos.length > 1 && sortPicker('360photos') }

      { _360photos.length > 0 && <Scroller title={i18n('360 Photos')} items={_360photos} is360Photos /> }

      { instagramStories.length > 1 && sortPicker('stories') }

      { instagramStories.length > 0 && <Scroller title="Stories" items={instagramStories} isStories webStoriesHref={host('/webstories/countries/' + country + '/cities/' + city + '/locations/' + location)} /> }

      { instagramPhotos.filter(p => !p.file_type).length > 1 && sortPicker('photos') }

      { instagramPhotos.filter(p => !p.file_type).length > 0 && <div className="container-fluid">
        <div className={ styles.instagram_photos }>
          <div className={ styles.instagram_photos_title }>
            <h3>{i18n('Posts')}</h3>
            { !expandGalleries ? <Link href={ `/countries/${country}/cities/${city}/locations/${location}/expand` + (sort !== 'desc' ? '?sort=' + sort : '')} scroll={false} prefetch={false}>{i18n('Expand Galleries')}</Link> : <Link href={ `/countries/${country}/cities/${city}/locations/${location}` + (sort !== 'desc' ? '?sort=' + sort : '')} scroll={false} prefetch={false}>{i18n('Minimize Galleries')}</Link> }
          </div>
          
          <div className={ styles.instagram_highlights_items }>
            {instagramPhotos.map(p => <InstagramMedia key={p.id} media={p} isBR={isBR} expandGalleries={expandGalleries} isListing />)}
          </div>
        </div>
      </div>}
    </div>
  </div>
}
