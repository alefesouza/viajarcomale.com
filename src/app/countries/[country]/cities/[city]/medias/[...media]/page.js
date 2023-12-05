import useI18n from '@/app/hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import { getFirestore } from 'firebase-admin/firestore';
import styles from './page.module.css';
import { FILE_DOMAIN, FILE_DOMAIN_500, SITE_NAME } from '@/app/utils/constants';
import { serialize } from 'tinyduration'
import { redirect } from 'next/navigation'
import InstagramMedia from '@/app/components/instagram-media';
import Link from 'next/link';
import ShareButton from '@/app/components/share-button';
import StructuredBreadcrumbs from '@/app/components/structured-breadcrumbs';
import Script from 'next/script';

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
  let description = isBR && theMedia.description_pt ? theMedia.description_pt : theMedia.description;

  if (!description && theMedia.location_data) {
    description = theMedia.location_data[0].name;
  }

  if (!description) {
    description = '';
  }

  const title = (description ? (description.split(' ').length > 10 ? description.split(' ').slice(0, 10).join(' ') + '…' : description) + ' - ' : '') + location + ' - ' + SITE_NAME;
  let image = theMedia.file_type === 'video' ? FILE_DOMAIN_500 + originalMedia.file : FILE_DOMAIN_500 + theMedia.file;

  if (theMedia.file.includes('.mp4')) {
    image = FILE_DOMAIN_500 + theMedia.file.replace('.mp4', '-thumb.png');
  }

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

  if (media.length > 2) {
    redirect(`/countries/${country}/cities/${city}/medias/${media[0]}/${media[1]}`);
  }

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

  const description = isBR && theMedia.description_pt ? theMedia.description_pt : theMedia.description;

  const breadcrumbs = [{
    name: i18n('Albums'),
    item: host('/countries'),
  }, {
    name: i18n(countryData.name),
    item: host('/countries/' + country),
  }, {
    name: isBR ? theCity.name_pt : theCity.name,
    item: host('/countries/' + country + '/cities/' + city),
  }];

  if (theMedia.type === 'instagram-story') {
    breadcrumbs.push({
      name: i18n('Stories'),
      item: host('/countries/' + country + '/cities/' + city + '/medias/' + media[0] + '/highlights/' + theMedia.highlight),
    });
  }

  breadcrumbs.push({
    name: (description && description.split(' ').length > 10 ? description.split(' ').slice(0, 10).join(' ') + '…' : description) || (theMedia.location_data ? theMedia.location_data[0].name : ''),
    item: host('/countries/' + country + '/cities/' + city + '/medias/' + media[0]),
  });

  return <div className="container">
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Link href={ '/countries/' + country + '/cities/' + city + (theMedia.type === 'instagram-story' ? '/highlights/' + theMedia.highlight : '') + (mediaIndex ? '/medias/' + theMedia.id : '') } id="back-button" scroll={false} prefetch={false}>
        <img src="/images/back.svg" alt="Back Button" width="30px"></img>
      </Link>

      <ShareButton />
    </div>
    
    <div>
      <h2>{isBR && theCity.name_pt ? theCity.name_pt : theCity.name} - {i18n(countryData.name)} {countryData.flag}</h2>
    </div>

    <div className={ styles.media }>
      <InstagramMedia media={theMedia} isBR={isBR} withoutLink expandGalleries fullQuality isMain />

      {theMedia.gallery && theMedia.gallery.length && theMedia.gallery.map(g => <div key={g.file} style={{ marginTop: 16 }}>
        {g.file.includes('.mp4') ? <InstagramMedia key={g.file} media={g} isBR={isBR} expandGalleries fullQuality isListing /> : <InstagramMedia key={g.file} media={g} isBR={isBR} expandGalleries fullQuality isListing />}
      </div>)}
    </div>

    <StructuredBreadcrumbs breadcrumbs={breadcrumbs} />

    {theMedia.file.includes('.mp4') && <Script id="ld-video" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": theMedia.location_data ? theMedia.location_data[0].name : isBR && theCity.name_pt ? theCity.name_pt : theCity.name + ' - ' + i18n(countryData.name),
      "description": theMedia.description,
      "thumbnailUrl": [
        FILE_DOMAIN_500 + theMedia.file.replace('.mp4', '-thumb.png')
       ],
      "uploadDate": theMedia.date ? theMedia.date.replace(' ', 'T') + '+03:00' : theCity.end + 'T12:00:00+03:00',
      "duration": serialize({ seconds: parseInt(theMedia.duration) }),
      "contentUrl": FILE_DOMAIN + theMedia.file
    }) }}></Script>}
  </div>
}
