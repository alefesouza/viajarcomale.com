import useI18n from '@/app/hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import { getFirestore } from 'firebase-admin/firestore';
import styles from './page.module.css';
import { FILE_DOMAIN, FILE_DOMAIN_500, FILE_DOMAIN_LANDSCAPE, FILE_DOMAIN_PORTRAIT, FILE_DOMAIN_SQUARE, SITE_NAME } from '@/app/utils/constants';
import { serialize } from 'tinyduration'
import { redirect } from 'next/navigation'
import InstagramMedia from '@/app/components/instagram-media';
import Link from 'next/link';
import ShareButton from '@/app/components/share-button';
import StructuredBreadcrumbs from '@/app/components/structured-breadcrumbs';
import Script from 'next/script';
import Pagination from '@/app/components/pagination';

async function getCountry(country, city) {
  const db = getFirestore();
  const countryDoc = await db.collection('countries').doc(country).get();
  const countryData = countryDoc.data();

  if (city && !countryData.cities.find(c => c.slug === city)) {
    return false;
  }
  
  return countryData;
}

function getSelectedMedia(media, theMedia, country, city) {
  let mediaIndex = null;

  if (media[1]) {
    mediaIndex = parseInt(media[1]);

    if (mediaIndex != media[1] || mediaIndex < 1 || (!theMedia.gallery && mediaIndex > 1) || mediaIndex > theMedia.gallery.length + 1) {
      redirect('/countries/' + country + '/cities/' + city + '/medias/' + media[0]);
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
  const mediaRef = await db.collection('countries').doc(country).collection('medias').doc(media[0]).get();
  let theMedia = mediaRef.data();

  if (!theMedia) {
    redirect('/');
  }

  if (theMedia.gallery && theMedia.gallery.length) {
    theMedia.gallery = theMedia.gallery.map((g, i) => ({ ...theMedia, ...g, is_gallery: true, img_index: i + 2 }));
  }
  
  const { selectedMedia } = getSelectedMedia(media, theMedia, country, city);

  theMedia = selectedMedia;

  const location = (theCity ? isBR && theCity.name_pt ? theCity.name_pt + ' - ' : theCity.name + ' - ' : '') + i18n(countryData.name);
  let description = isBR && theMedia.description_pt ? theMedia.description_pt : theMedia.description;

  if (!description && theMedia.location_data) {
    description = theMedia.location_data.map(l => l.name).join(', ');
  }

  if (!description) {
    description = '';
  }

  const title = (description ? (description.split(' ').length > 10 ? description.split(' ').slice(0, 10).join(' ') + '…' : description) + ' - ' : '') + (media[1] ? 'Item ' + media[1] + ' - ' : '') + location + ' - ' + SITE_NAME;
  let image = FILE_DOMAIN_500 + theMedia.file;

  if (theMedia.file.includes('.mp4')) {
    image = FILE_DOMAIN_500 + theMedia.file.replace('.mp4', '-thumb.png');
  }

  if (theMedia.type === 'instagram-story') {
    image = FILE_DOMAIN_SQUARE + theMedia.file.replace('.mp4', '-thumb.png');
  }

  const images = [{
    url: image,
    width: theMedia.type === 'instagram-story' ? theMedia.width : 500,
    height: theMedia.type === 'instagram-story' ? theMedia.width : Math.round((theMedia.height / theMedia.width) * 500),
    type: theMedia.file.includes('.png') ? 'image/png' : 'image/jpeg',
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
  let galleryLength = 0;

  if (theMedia.gallery && theMedia.gallery.length) {
    theMedia.gallery = theMedia.gallery.map((g, i) => ({ ...theMedia, ...g, is_gallery: true, img_index: i + 2 }));
    galleryLength = theMedia.gallery.length + 1;
  }

  const { mediaIndex, selectedMedia } = getSelectedMedia(media, theMedia, country, city);
  theMedia = selectedMedia;

  const description = ((isBR && theMedia.description_pt ? theMedia.description_pt : theMedia.description) || '');
  const shortDescription = description.split(' ').length > 10 ? description.split(' ').slice(0, 10).join(' ') + '…' : description;
  const location = theMedia.location_data && theMedia.location_data.map((c) => c.name).join(', ');
  const hashtags = theMedia.hashtags && theMedia.hashtags.length ? ('Hashtags: ' + (isBR && theMedia.hashtags_pt ? theMedia.hashtags_pt : theMedia.hashtags).map((c) => '#' + c).join(', ')) : '';
  
  const title = (shortDescription ? shortDescription + ' - ' : '') + (location ? location + ' - ' : '') + (isBR && theCity.name_pt ? theCity.name_pt : theCity.name) + ' - ' + i18n(countryData.name) + ' - ' + SITE_NAME;
  
  const breadcrumbs = [{
    name: i18n(countryData.name),
    item: host('/countries/' + country),
  }, {
    name: isBR && theCity.name_pt ? theCity.name_pt : theCity.name,
    item: host('/countries/' + country + '/cities/' + city),
  }];

  if (theMedia.type === 'instagram-story') {
    breadcrumbs.push({
      name: i18n('Stories'),
      item: host('/countries/' + country + '/cities/' + city + '/highlights/' + theMedia.highlight),
    });
  }

  const basePath = '/countries/' + country + '/cities/' + city + '/medias/' + media[0];

  breadcrumbs.push({
    name: (shortDescription ? shortDescription + ' - ' : '') + (location ? location + ' - ' : ''),
    item: host(basePath),
  });

  if (media[1]) {
    breadcrumbs.push({
      name: 'Item ' + media[1],
      item: host(basePath) + media[1],
    });
  }

  const paginationBase = basePath + '/{page}';

  return <div className="container">
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Link href={ '/countries/' + country + '/cities/' + city + (theMedia.type === 'instagram-story' ? '/highlights/' + theMedia.highlight : '') + (mediaIndex ? '/medias/' + theMedia.id : '') } id="back-button" scroll={false} prefetch={false}>
        <img src="/images/back.svg" alt={i18n('Back')} width="32px"></img>
      </Link>

      <ShareButton />
    </div>
    
    <div>
      <h2>{isBR && theCity.name_pt ? theCity.name_pt : theCity.name} - {i18n(countryData.name)} {countryData.flag}</h2>
    </div>

    <div className={ styles.media }>
      <InstagramMedia media={theMedia} isBR={isBR} withoutLink expandGalleries fullQuality isMain />

      {media[1] && galleryLength > 0 && <div style={{marginTop: 24}}><Pagination base={paginationBase} currentPage={Number(media[1]) || 1} pageNumber={galleryLength} isGallery total={5} /></div>}

      {theMedia.gallery && theMedia.gallery.length && theMedia.gallery.map(g => <div key={g.file} style={{ marginTop: 16 }}>
        <InstagramMedia key={g.file} media={g} isBR={isBR} expandGalleries fullQuality isListing />
      </div>)}
    </div>

    <StructuredBreadcrumbs breadcrumbs={breadcrumbs} />

    {theMedia.file.includes('.mp4') && <Script id="ld-video" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": title,
      "description": description + (hashtags ? (description ? ' - ' : '') + hashtags : ''),
      "thumbnailUrl": [
        FILE_DOMAIN + theMedia.file.replace('.mp4', '-thumb.png'),
        FILE_DOMAIN_500 + theMedia.file.replace('.mp4', '-thumb.png'),
        ...theMedia.type === 'instagram-story' ? [
          FILE_DOMAIN_PORTRAIT + theMedia.file.replace('.mp4', '-thumb.png'),
          FILE_DOMAIN_LANDSCAPE + theMedia.file.replace('.mp4', '-thumb.png'),
          FILE_DOMAIN_SQUARE + theMedia.file.replace('.mp4', '-thumb.png'),
        ] : []
       ],
      "uploadDate": theMedia.date ? theMedia.date.replace(' ', 'T') + '+03:00' : theCity.end + 'T12:00:00+03:00',
      "duration": serialize({ seconds: parseInt(theMedia.duration) }),
      "contentUrl": FILE_DOMAIN + theMedia.file
    }) }}></Script>}

    <Script id="ld-image" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "ImageObject",
      "contentUrl": FILE_DOMAIN + (theMedia.file.includes('.mp4') ? theMedia.file.replace('.mp4', '-thumb.png') : theMedia.file),
      "creditText": {SITE_NAME},
      "creator": {
        "@type": "Person",
        "name": "Alefe Souza"
       },
      "copyrightNotice": SITE_NAME + " - @viajarcomale"
    }) }}></Script>
  </div>
}
