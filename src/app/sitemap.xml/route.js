import {parse} from 'js2xmlparser';
import useHost from '../hooks/use-host';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { ITEMS_PER_PAGE } from '../utils/constants';
import { customInitApp } from '../firebase';

customInitApp();

export async function GET() {
  const host = useHost();
  const lastmod = '2023-11-10';

  const db = getFirestore();
  const countriesSnapshot = await db.collection('countries').get();
  let countries = [];

  countriesSnapshot.forEach((country) => {
    countries = [...countries, country.data()];
  });

  const allHashtagsRef = await db.collection('all_hashtags').doc('all_hashtags').get();
  const hashtags = allHashtagsRef.data().hashtags;
  const mediasSnapshot = await db.collectionGroup('medias').get();
  const medias = [];
  mediasSnapshot.forEach(doc => {
    medias.push(doc.data());
  });

  console.log(medias.length)
  const obj = {
    '@': {
      xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
    },
    url: [{
      loc: host('/'),
      lastmod,
    }, {
      loc: host('/countries'),
      lastmod,
    },
    ...countries.flatMap(c => [{
        loc: host('/countries/' + c.slug),
        lastmod,
      }, {
        loc: host('/countries/' + c.slug + '/expand'),
        lastmod,
      },
      ...Array.from({ length: Math.ceil((c?.totals?.instagram_photos / ITEMS_PER_PAGE) - 1) }, (_, i) => [{
        loc: host('/countries/' + c.slug + '/page/' + (i + 2)),
        lastmod,
      }, {
        loc: host('/countries/' + c.slug + '/page/' + (i + 2) + '/expand'),
        lastmod,
      }]),
    ]),
    ...countries.map(c => c.cities.map(city => [{
        loc: host('/countries/' + c.slug + '/cities/' + city.slug),
        lastmod,
      }, {
        loc: host('/countries/' + c.slug + '/cities/' + city.slug + '/expand'),
        lastmod,
      },
      ...Array.from({ length: Math.ceil((city?.totals?.instagram_photos / ITEMS_PER_PAGE) - 1) }, (_, i) => [{
        loc: host('/countries/' + c.slug + '/cities/' + city.slug + '/page/' + (i + 2)),
        lastmod,
      }, {
        loc: host('/countries/' + c.slug + '/cities/' + city.slug + '/page/' + (i + 2) + '/expand'),
        lastmod,
      }]),
    ])).flat(2),
    ...hashtags.flatMap(h => [{
      loc: host('/hashtags/') + decodeURIComponent(h),
      lastmod,
    }, {
      loc: host('/hashtags/') + decodeURIComponent(h) + '/expand',
      lastmod,
    }]),
    ...medias.filter(m => m.type === 'instagram').flatMap(m => [{
      loc: host('/countries/' + m.country + '/cities/' + m.city + '/medias/' + m.id),
      lastmod,
    }, ...m.gallery.map((g, i) => ({
      loc: host('/countries/' + m.country + '/cities/' + m.city + '/medias/' + m.id + '/' + (i + 2)),
      lastmod,
    }))])]
  };

  db.collection('accesses').doc((new Date()).toISOString().split('T')[0]).set({
    [host('/sitemap.xml')]: FieldValue.increment(1),
  }, {merge:true});

  return new Response(parse('urlset', obj, { declaration: { encoding: 'UTF-8' } }), {
    headers: { 'Content-Type': 'application/xml' },
  });
}
