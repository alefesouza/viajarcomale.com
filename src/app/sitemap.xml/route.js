import {parse} from 'js2xmlparser';
import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { FILE_DOMAIN, FILE_DOMAIN_500, ITEMS_PER_PAGE, SITE_NAME } from '../utils/constants';
import { customInitApp } from '../firebase';

customInitApp();

export async function GET() {
  const host = useHost();
  const i18n = useI18n();
  const isBR = host().includes('viajarcomale.com.br');
  const lastmod = '2023-12-06';

  const db = getFirestore();
  const reference = host('sitemap.json').split('//')[1].replaceAll('/', '-');

  const storage = getStorage();
  const cacheExists = await storage.bucket('viajarcomale.appspot.com').file(reference).exists();

  let obj = {};

  if (!cacheExists[0]) {
    const countriesSnapshot = await db.collection('countries').get();
    let countries = [];

    countriesSnapshot.forEach((country) => {
      countries = [...countries, country.data()];
    });

    const mediasSnapshot = await db.collectionGroup('medias').get();
    const medias = [];
    mediasSnapshot.forEach(doc => {
      medias.push(doc.data());
    });
    const locationsSnapshot = await db.collectionGroup('locations').get();
    const locations = [];
    locationsSnapshot.forEach(doc => {
      locations.push(doc.data());
    });
    const hashtagsSnapshot = await db.collectionGroup('hashtags').get();
    const hashtags = [];
    hashtagsSnapshot.forEach(doc => {
      hashtags.push(doc.data());
    });
    const highlights = medias.filter(m => m.type === 'instagram-highlight');

    const mediaProcessing = (media, gallery, position) => {
      const item = gallery || media;

      if (!item) {
        return {};
      }

      if (item.file.includes('.mp4')) {
        const theCountry = countries.find(c => c.slug == media.country)
        const theCity = theCountry.cities.find(c => c.slug == media.city)
        
        const description = ((isBR && media.description_pt ? media.description_pt : media.description) || '');
        const shortDescription = description.split(' ').length > 10 ? description.split(' ').slice(0, 10).join(' ') + '…' : description;
        const location = media.location_data && media.location_data.map((c) => c.name).join(', ');
        
        const title = (shortDescription ? shortDescription + ' - ' : (location ? location + ' - ' : '')) + (position && position > 1 ? 'Item ' + position + ' - ' : '') + (isBR && theCity.name_pt ? theCity.name_pt : theCity.name) + ' - ' + i18n(theCountry.name) + ' - ' + SITE_NAME;
        
        return { 'video:video': [{
          'video:thumbnail_loc': FILE_DOMAIN + item.file.replace('.mp4', '-thumb.png'),
          'video:content_loc': FILE_DOMAIN + item.file,
          'video:title': title,
          'video:description': description,
          'video:duration': parseInt(item.duration),
          'video:publication_date': media.date ? media.date.replace(' ', 'T') + '+03:00' : theCity.end + 'T12:00:00+03:00',
          'video:family_friendly': 'yes',
          'video:requires_subscription': 'no',
          'video:live': 'no',
        }]};
      }

      return {
        'image:image': [{
          'image:loc': FILE_DOMAIN + item.file,
        }],
      };
    }
    
    const makeLoc = (loc, extra = '', enName = '', ptName = '') => {
      const theLoc = host(loc) + extra;

      return {
        loc: isBR ? (theLoc.replace(enName, ptName || enName)) : theLoc,
        'xhtml:link': [{
          '@': {
            rel: 'alternate',
            hreflang: 'en',
            href: 'https://viajarcomale.com' + loc + extra,
          },
        }, {
          '@': {
            rel: 'alternate',
            hreflang: 'pt',
            href: ('https://viajarcomale.com.br' + loc + extra).replace(enName, ptName || enName),
          },
        }],
        lastmod,
      }
    }

    obj = {
      '@': {
        xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
        'xmlns:image': 'http://www.google.com/schemas/sitemap-image/1.1',
        'xmlns:video': 'http://www.google.com/schemas/sitemap-video/1.1',
        'xmlns:xhtml': 'http://www.w3.org/1999/xhtml',
      },
      url: [{
        ...makeLoc('/')
      }, {
        ...makeLoc('/countries'),
      },
      ...countries.flatMap(c => [{
        ...makeLoc('/countries/' + c.slug),
        }, {
          ...makeLoc('/countries/' + c.slug + '/expand'),
        },
        ...Array.from({ length: Math.ceil((c?.totals?.instagram_photos / ITEMS_PER_PAGE) - 1) }, (_, i) => [{
          ...makeLoc('/countries/' + c.slug + '/page/' + (i + 2)),
        }, {
          ...makeLoc('/countries/' + c.slug + '/page/' + (i + 2) + '/expand'),
        }]),
      ]),
      ...countries.map(c => c.cities.map(city => [{
        ...makeLoc('/countries/' + c.slug + '/cities/' + city.slug),
        }, {
          ...makeLoc('/countries/' + c.slug + '/cities/' + city.slug + '/expand'),
        },
        ...Array.from({ length: Math.ceil((city?.totals?.instagram_photos / ITEMS_PER_PAGE) - 1) }, (_, i) => [{
          ...makeLoc('/countries/' + c.slug + '/cities/' + city.slug + '/page/' + (i + 2)),
        }, {
          ...makeLoc('/countries/' + c.slug + '/cities/' + city.slug + '/page/' + (i + 2) + '/expand'),
        }]),
      ])).flat(2),
      ...highlights.map((m) => ({
        ...makeLoc('/countries/' + m.country + '/cities/' + m.city + '/highlights/' + m.id),
      })),
      ...locations.map(m => ({
        ...makeLoc('/countries/' + m.country + '/cities/' + m.city + '/locations/', decodeURIComponent(m.slug)),
      })),
      ...locations.filter(m => m?.totals?.posts > 0).map(m => ({
        ...makeLoc('/countries/' + m.country + '/cities/' + m.city + '/locations/', decodeURIComponent(m.slug) + '/expand'),
      })),
      ...hashtags.map(h => ({
        ...makeLoc('/hashtags/', decodeURIComponent(h.name), h.name, h.name_pt),
      })),
      ...hashtags.filter(h => h?.totals?.posts > 0).map(h => ({
        ...makeLoc('/hashtags/', decodeURIComponent(h.name) + '/expand', h.name, h.name_pt),
      })),
      ...medias.filter(m => m.type === 'instagram-story').map((m) => ({
        ...makeLoc('/countries/' + m.country + '/cities/' + m.city + '/medias/' + m.id),
        ...mediaProcessing(m, null),
      })),
      ...medias.filter(m => m.type === 'instagram').flatMap(m => [{
        ...makeLoc('/countries/' + m.country + '/cities/' + m.city + '/medias/' + m.id),
      }, {
        ...makeLoc('/countries/' + m.country + '/cities/' + m.city + '/medias/' + m.id + '/1'),
        ...mediaProcessing(m, null),
      },
      ...m.gallery.map((g, i) => ({
          ...makeLoc('/countries/' + m.country + '/cities/' + m.city + '/medias/' + m.id + '/' + (i + 2)),
          ...mediaProcessing(m, g, (i + 2)),
        }))
      ])],
    };

    storage.bucket('viajarcomale.appspot.com').file(reference).save(JSON.stringify(obj));
  }

  if (cacheExists[0]) {
    const contents = await storage.bucket('viajarcomale.appspot.com').file(reference).download();
    obj = JSON.parse(contents);
  }

  db.collection('accesses').doc((new Date()).toISOString().split('T')[0]).set({
    [host('/sitemap.xml')]: FieldValue.increment(1),
  }, {merge:true});

  return new Response(parse('urlset', obj, { declaration: { encoding: 'UTF-8' } }), {
    headers: { 'Content-Type': 'application/xml' },
  });
}
