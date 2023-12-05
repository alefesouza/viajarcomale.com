import useI18n from '@/app/hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import styles from './page.module.css';
import { FILE_DOMAIN_500, SITE_NAME } from '@/app/utils/constants';
import { redirect } from 'next/dist/server/api-utils';
import InstagramMedia from '@/app/components/instagram-media';
import ShareButton from '@/app/components/share-button';
import randomIntFromInterval from '@/app/utils/random-int';

async function getCountry(country, city) {
  const db = getFirestore();
  const countryDoc = await db.collection('countries').doc(country).get();
  const countryData = countryDoc.data();

  if (city && !countryData.cities.find(c => c.slug === city)) {
    return false;
  }
  
  return countryData;
}

export async function generateMetadata({ params: { country, city, highlight } }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  const countryData = await getCountry(country, city);

  if (!countryData) {
    return {};
  }

  let theCity = null;

  if (city) {
    theCity = countryData.cities.find(c => c.slug === city);
  }

  if (!theCity) {
    return {};
  }

  const db = getFirestore();
  const mediaRef = await db.collection('countries').doc(country).collection('medias').doc(highlight).get();
  let theMedia = mediaRef.data();

  if (theMedia.gallery && theMedia.gallery.length) {
    theMedia.gallery = theMedia.gallery.map((g, i) => ({ ...theMedia, ...g, is_gallery: true, img_index: i + 2 }));
  }
  
  const location = (theCity ? isBR && theCity.name_pt ? theCity.name_pt + ' - ' : theCity.name + ' - ' : '') + i18n(countryData.name);
  const title = i18n('Stories') + ' - ' + location + ' - ' + SITE_NAME;
  const image = FILE_DOMAIN_500 + theMedia.file;
  const description = i18n('Viajar com Alê stories in :location:', {
    location: isBR && theCity.name_pt ? theCity.name_pt : theCity.name,
  });

  const images = [{
    url: image,
    width: theMedia.width,
    height: theMedia.height,
    type: 'image/jpg',
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
  }
}

export default async function Highlight({ params: { country, city, highlight }, searchParams }) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  const highlightId = decodeURIComponent(highlight);

  let sort = searchParams.sort && ['asc', 'desc', 'random'].includes(searchParams.sort) && searchParams.sort || 'desc';

  const cacheRef = `/caches/highlights/highlights/${highlightId}/sort/${sort === 'asc' ? 'asc' : 'desc'}`;

  const countryData = await getCountry(country, city);

  if (!countryData) {
    redirect('/');
  }

  let theCity = countryData.cities.find(c => c.slug === city);

  const db = getFirestore();
  // const cache = await db.doc(cacheRef).get();
  const cache = { exists: false };

  let isRandom = sort === 'random';

  if (isRandom) {
    sort = 'desc';
  }

  let photos = [];

  const mediaRef = await db.collection('countries').doc(country).collection('medias').doc(highlight).get();
  let theMedia = mediaRef.data();

  if (!cache.exists) {
    const photosSnapshot = await db.collection('countries').doc(country).collection('medias').where('highlight', '==', highlight).orderBy('date', sort).get();

    photosSnapshot.forEach((photo) => {
      const data = photo.data();
      data.link = theMedia.link;

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
    [host('/highlights/') + highlightId + ('?sort=' + sort)]: FieldValue.increment(1),
  }, {merge:true});

  let newShuffle = randomIntFromInterval(1, 15);

  if (newShuffle == searchParams.shuffle) {
    newShuffle = randomIntFromInterval(1, 15);
  }

  const basePath = '/countries/' + country + '/cities/' + city + '/highlights/' + highlightId;

  const sortPicker = (type) => (<div className="container-fluid">
    <div className={ styles.sort_picker }>
      <span>{i18n('Sorting')}:</span>

      {[{name: 'Latest', value: 'desc'}, {name: 'Oldest', value: 'asc'}, {name: 'Random', value: 'random'}].map((o) => <Link key={o} href={ o.value === 'random' ? sort === 'random' ? basePath : basePath + '?sort=random&shuffle=' + newShuffle : o.value !== 'desc' ? '?sort=' + o.value : basePath } scroll={false} prefetch={false}><label><input type="radio" name={'sort-' + type } value={o.value} checked={sort === o.value} readOnly />{i18n(o.name)}</label></Link>)}
    </div>
  </div>);

  let instagramStories = photos.filter(p => p.type === 'instagram-story' );

  return <div>
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Link href={ '/countries/' + country + '/cities/' + city } id="back-button" className={ styles.history_back_button } scroll={false}>
          <img src="/images/back.svg" alt="Back Button" width="30px"></img>
        </Link>

        <ShareButton />
      </div>
    </div>
    
    <div className="container-fluid">
      <h2>{i18n('Stories')} - {isBR && theCity.name_pt ? theCity.name_pt : theCity.name} - {i18n(countryData.name)} {countryData.flag}</h2>
    </div>

    <div className={ styles.galleries }>
      { instagramStories.filter(p => !p.file_type).length > 1 && sortPicker('photos') }

      { instagramStories.filter(p => !p.file_type).length > 0 && <div className="container-fluid">
        <div className={ styles.instagram_photos }>
          <div className={ styles.instagram_photos_title }>
            <h3>{i18n('Stories')}</h3>
          </div>
          
          <div className={ styles.instagram_highlights_items }>
            {instagramStories.map(p => <InstagramMedia key={p.id} media={p} isBR={isBR} hasPoster isListing />)}
          </div>
        </div>
      </div>}
    </div>
  </div>
}
