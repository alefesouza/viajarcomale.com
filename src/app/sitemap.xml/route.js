import {parse} from 'js2xmlparser';
import useHost from '../hooks/use-host';
import app from '../firebase';
import { getFirestore, getDocs, collection, query } from 'firebase/firestore';

export async function GET() {
  const host = useHost();
  const lastmod = '2023-11-06';

  const db = getFirestore(app);
  const countriesSnapshot = await getDocs(query(collection(db, 'countries')));
  let countries = [];

  countriesSnapshot.forEach((country) => {
    countries = [...countries, country.data()];
  });

  const hashtagsSnapshot = await getDocs(query(collection(db, 'hashtags')));
  let hashtags = [];

  hashtagsSnapshot.forEach((hashtag) => {
    hashtags = [...hashtags, hashtag.data()];
  });

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
    }]),
    ...countries.map(c => c.cities.map(city => [{
      loc: host('/countries/' + c.slug + '/cities/' + city.slug),
      lastmod,
    }, {
      loc: host('/countries/' + c.slug + '/cities/' + city.slug + '/expand'),
      lastmod,
    }])).flat(2),
    ...hashtags.flatMap(h => [{
      loc: host('/hashtags/') + decodeURIComponent(h.name),
      lastmod,
    }, {
      loc: host('/hashtags/') + decodeURIComponent(h.name) + '/expand',
      lastmod,
    }]),]
  };

  return new Response(`<?xml version="1.0" encoding="UTF-8" ?>${parse('urlset', obj)}`);
}
