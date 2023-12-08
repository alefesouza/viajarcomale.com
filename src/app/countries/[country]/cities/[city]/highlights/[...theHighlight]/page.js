import useI18n from '@/app/hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import styles from './page.module.css';
import { FILE_DOMAIN, FILE_DOMAIN_500, FILE_DOMAIN_SQUARE, SITE_NAME } from '@/app/utils/constants';
import { redirect } from 'next/navigation';
import InstagramMedia from '@/app/components/instagram-media';
import ShareButton from '@/app/components/share-button';
import randomIntFromInterval from '@/app/utils/random-int';
import WebStories from '@/app/components/webstories';
import { headers } from 'next/headers';

async function getCountry(country, city) {
  const db = getFirestore();
  const countryDoc = await db.collection('countries').doc(country).get();
  const countryData = countryDoc.data();

  if (city && !countryData.cities.find(c => c.slug === city)) {
    return false;
  }
  
  return countryData;
}

export async function generateMetadata({ params: { country, city, theHighlight } }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  const isWebStories = theHighlight[1] === 'webstories';

  if (theHighlight.length > 2 || (theHighlight[1] && theHighlight[1] !== 'webstories')) {
    redirect(`/countries/${country}/cities/${city}/highlights/${theHighlight[0]}`);
  }

  const highlight = theHighlight[0];

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

  const db = getFirestore();
  const mediaRef = await db.collection('countries').doc(country).collection('medias').doc(highlight).get();
  let theMedia = mediaRef.data();

  if (theMedia.gallery && theMedia.gallery.length) {
    theMedia.gallery = theMedia.gallery.map((g, i) => ({ ...theMedia, ...g, is_gallery: true, img_index: i + 2 }));
  }
  
  const location = (theCity ? isBR && theCity.name_pt ? theCity.name_pt + ' - ' : theCity.name + ' - ' : '') + i18n(countryData.name);
  const title = i18n('Stories') + ' - ' + location + ' - ' + (isWebStories ? 'Web Stories - ' : '') + SITE_NAME;
  const image = FILE_DOMAIN_SQUARE + theMedia.file;
  const description = i18n('Viajar com Alê stories in :location:', {
    location: isBR && theCity.name_pt ? theCity.name_pt : theCity.name,
  });

  const images = [{
    url: image,
    width: theMedia.width,
    height: theMedia.width,
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
    ...!isWebStories ? {
    icons: {
      // Why Next.js doesn't just allow us to create custom <link> tags directly...
      other: {
        rel: 'amphtml',
        url: host('/webstories/countries/' + country + '/cities/' + city + '/highlights/' + highlight),
      },
    } } : null,
  }
}

export default async function Highlight({ params: { country, city, theHighlight }, searchParams }) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  const highlight = theHighlight[0];
  const highlightId = decodeURIComponent(highlight);

  let sort = searchParams.sort && ['asc', 'desc', 'random'].includes(searchParams.sort) && searchParams.sort || 'desc';

  if (!searchParams.sort && theHighlight && theHighlight[1] === 'webstories') {
    sort = 'asc';
  }

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

  const isWebStories = theHighlight[1] === 'webstories';
  db.collection('accesses').doc('accesses').collection((new Date()).toISOString().split('T')[0]).doc((host((isWebStories ? '/webstories' : '') + '/highlights/') + highlightId + ('?sort=' + sort)).replace('https://viajarcomale', '').replaceAll('/', '-')).set({
    accesses: FieldValue.increment(1),
    lastUserAgent: headers().get('user-agent') || '',
    lastIpAddress: headers().get('x-forwarded-for') || '',
  }, {merge:true});

  let instagramStories = photos.filter(p => p.type === 'instagram-story' );

  if (theHighlight && theHighlight[1] === 'webstories') {
    const location = (theCity ? isBR && theCity.name_pt ? theCity.name_pt + ' - ' : theCity.name + ' - ' : '') + i18n(countryData.name);
    const title = i18n('Stories') + ' - ' + location;

    return <WebStories title={title} storyTitle={location} items={instagramStories} highlightItem={theMedia} />
  }

  let newShuffle = randomIntFromInterval(1, 15);

  if (newShuffle == searchParams.shuffle) {
    newShuffle = randomIntFromInterval(1, 15);
  }

  const basePath = '/countries/' + country + '/cities/' + city + '/highlights/' + highlightId;

  const sortPicker = (type) => (<div className="container-fluid">
    <div className={ styles.sort_picker }>
      <span>{i18n('Sorting')}:</span>

      {[{name: 'Latest', value: 'desc'}, {name: 'Oldest', value: 'asc'}, {name: 'Random', value: 'random'}].map((o) => <Link key={o} href={ o.value === 'random' ? sort === 'random' ? basePath : basePath + '?sort=random&shuffle=' + newShuffle : o.value !== 'desc' ? '?sort=' + o.value : basePath } scroll={false}><label><input type="radio" name={'sort-' + type } value={o.value} checked={sort === o.value} readOnly />{i18n(o.name)}</label></Link>)}
    </div>
  </div>);

  return <div>
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Link href={ '/countries/' + country + '/cities/' + city } id="back-button" className={ styles.history_back_button } scroll={false}>
          <img src="/images/back.svg" alt={i18n('Back')} width="32px"></img>
        </Link>

        <div style={{display: 'flex', gap: 16}}>
          {<a href={host('/webstories/countries/' + country + '/cities/' + city + '/highlights/' + highlightId)} target="_blank" title={i18n('Play')}>
            <img src={host('/images/play.svg')} width={30} height={30} alt={i18n('Play')} />
          </a>}
          <ShareButton />
        </div>
      </div>
    </div>
    
    <div className="container-fluid">
      <h2>{i18n('Stories')} - {isBR && theCity.name_pt ? theCity.name_pt : theCity.name} - {i18n(countryData.name)} {countryData.flag}</h2>
    </div>

    <div className="center_link" style={{ marginTop: 28 }}>
      <a href={host('/webstories/countries/' + country + '/cities/' + city + '/highlights/' + highlight)} target="_blank">{i18n('Open in Stories format')}</a>
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
