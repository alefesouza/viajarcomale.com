import useI18n from '@/app/hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import { getFirestore } from 'firebase-admin/firestore';
import styles from './page.module.css';
import { FILE_DOMAIN_500, SITE_NAME } from '@/app/utils/constants';
import { redirect } from 'next/navigation'
import InstagramMedia from '@/app/components/instagram-media';
import Link from 'next/link';
import ShareButton from '@/app/components/share-button';

async function getCountry(country, city) {
  const db = getFirestore();
  const countryDoc = await db.collection('countries').doc(country).get();
  const countryData = countryDoc.data();

  if (city && !countryData.cities.find(c => c.slug === city)) {
    return false;
  }
  
  return countryData;
}

function getSelectedMedia(media, theMedia) {
  let mediaIndex = null;

  if (media[1]) {
    mediaIndex = parseInt(media[1]);

    if (mediaIndex != media[1] || mediaIndex < 1 || (!theMedia.gallery && mediaIndex > 1) || mediaIndex > theMedia.gallery.length + 1) {
      redirect('/');
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
  }
}

export async function generateMetadata({ params: { country, city, media } }) {
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
  const mediaRef = await db.collection('countries').doc(country).collection('medias').doc(media[0]).get();
  let theMedia = mediaRef.data();

  if (theMedia.gallery && theMedia.gallery.length) {
    theMedia.gallery = theMedia.gallery.map((g, i) => ({ ...theMedia, ...g, is_gallery: true, img_index: i + 2 }));
  }
  
  const { selectedMedia } = getSelectedMedia(media, theMedia);

  const originalMedia = theMedia;
  theMedia = selectedMedia;

  const location = (theCity ? isBR && theCity.name_pt ? theCity.name_pt + ' - ' : theCity.name + ' - ' : '') + i18n(countryData.name);
  const title = (theMedia.file_type === 'video' ? i18n('Video') : i18n('Photo')) + ' - ' + location + ' - ' + i18n('Albums') + ' - ' + SITE_NAME;
  const description = isBR && theMedia.description_pt ? theMedia.description_pt : theMedia.description;
  const image = theMedia.file_type === 'video' ? FILE_DOMAIN_500 + originalMedia.file : FILE_DOMAIN_500 + theMedia.file;

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

export default async function Country({ params: { country, city, media } }) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  const countryData = await getCountry(country, city);

  if (!countryData) {
    redirect('/');
  }

  let theCity = countryData.cities.find(c => c.slug === city);

  if (!theCity) {
    redirect('/');
  }

  const db = getFirestore();
  const mediaRef = await db.collection('countries').doc(country).collection('medias').doc(media[0]).get();
  let theMedia = mediaRef.data();

  if (theMedia.gallery && theMedia.gallery.length) {
    theMedia.gallery = theMedia.gallery.map((g, i) => ({ ...theMedia, ...g, is_gallery: true, img_index: i + 2 }));
  }

  const { mediaIndex, selectedMedia } = getSelectedMedia(media, theMedia);
  theMedia = selectedMedia;

  return <div className="container">
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Link href={ '/countries/' + country + '/cities/' + city + (mediaIndex ? '/medias/' + theMedia.id : '') }>
        <img src="/images/back.svg" alt="Back Button" width="30px"></img>
      </Link>

      <ShareButton />
    </div>
    
    <div>
      <h2>{isBR && theCity.name_pt ? theCity.name_pt : theCity.name} - {i18n(countryData.name)} {countryData.flag}</h2>
    </div>

    <div className={ styles.media }>
      <InstagramMedia media={theMedia} isBR={isBR} withoutLink expandGalleries fullQuality />

      {theMedia.gallery && theMedia.gallery.length && theMedia.gallery.map(g => <div key={g.file} style={{ marginTop: 16 }}>
        <InstagramMedia key={g.file} media={g} isBR={isBR} withoutLink expandGalleries fullQuality />
      </div>)}
    </div>
  </div>
}