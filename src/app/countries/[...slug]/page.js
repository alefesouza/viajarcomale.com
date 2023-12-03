import useI18n from '../../hooks/use-i18n';
import { redirect } from 'next/navigation';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import styles from '../page.module.css';
import { FILE_DOMAIN, FILE_DOMAIN_500, ITEMS_PER_PAGE, SITE_NAME } from '@/app/utils/constants';
import Pagination from '@/app/components/pagination';
import StructuredBreadcrumbs from '@/app/components/structured-breadcrumbs';
import arrayShuffle from '@/app/utils/array-shuffle';
import Scroller from '@/app/components/scroller';
import randomIntFromInterval from '@/app/utils/random-int';
import InstagramMedia from '@/app/components/instagram-media';
import ShareButton from '@/app/components/share-button';

function getDataFromRoute(slug, searchParams) {
  const [country, path1, path2, path3, path4, path5] = slug;
  // {country}
  // {country}/page/{page}
  // {country}/expand
  // {country}/page/{page}/expand
  // {country}/cities/{city}
  // {country}/cities/{city}/page/{page}
  // {country}/cities/{city}/page/{page}/expand

  let city = null;

  if (path1 === 'cities') {
    city = path2;
  }

  let page = path1 === 'page' ? path2 : path3 === 'page' ? path4 : 1;
  page = parseInt(page);
  page = isNaN(page) ? 1 : page;

  const expandGalleries = path1 === 'expand' || path3 === 'expand' || path5 === 'expand';
  let sort = searchParams.sort && ['asc', 'desc', 'random'].includes(searchParams.sort) && searchParams.sort || 'desc';

  return {
    country,
    city,
    page,
    expandGalleries,
    sort,
  }
}

async function getCountry(db, slug, searchParams) {
  let { country, city } = getDataFromRoute(slug, searchParams);

  const countryDoc = await db.collection('countries').doc(country).get();
  const countryData = countryDoc.data();

  if (city && !countryData.cities.find(c => c.slug === city)) {
    return false;
  }
  
  return countryData;
}

export async function generateMetadata({ params: { slug }, searchParams }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  const db = getFirestore();
  const countryData = await getCountry(db, slug, searchParams);

  if (!countryData) {
    return {};
  }

  let { city } = getDataFromRoute(slug, searchParams);
  let theCity = null;

  if (city) {
    theCity = countryData.cities.find(c => c.slug === city);
  }

  const location = (theCity ? isBR && theCity.name_pt ? theCity.name_pt + ' - ' : theCity.name + ' - ' : '') + i18n(countryData.name);
  const title = location + ' - ' + i18n('Albums') + ' - ' + SITE_NAME;
  const description = i18n('Photos and videos taken by Viajar com Alê in :location:.', {
    location
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
  }
}

export default async function Country({ params: { slug }, searchParams }) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  if (searchParams.shuffle) {
    const theShuffle = parseInt(searchParams.shuffle);

    if (theShuffle != searchParams.shuffle || theShuffle < 1 || theShuffle > 15) {
      redirect('/');
    }
  }
  
  if (searchParams.sort == 'random' && (!searchParams.shuffle || Object.keys(searchParams).length > 2)) {
    redirect('/');
  }
  
  const db = getFirestore();
  const countryData = await getCountry(db, slug, searchParams);

  if (!countryData) {
    redirect('/');
  }

  let { country, city, page, sort, expandGalleries } = getDataFromRoute(slug, searchParams);

  const cacheRef = `/caches/countries/countries/${country}/caches${city ? '/' + city : '/country'}/page/${page}/sort/${sort === 'asc' ? 'asc' : 'desc'}`;

  const cache = await db.doc(cacheRef).get();

  let instagramHighLightsSnapshot = null;
  let shortVideosSnapshot = null;
  let instagramPhotosSnapshot = null;
  let youtubeSnapshot = null;
  let _360PhotosSnapshot = null;
  let isRandom = sort === 'random';
  let randomArray = [];

  const cityData = countryData.cities.reduce((prev, curr, i) => {
    prev[curr.slug] = curr;

    return prev;
  }, {});

  const totalPhotos = city ? cityData[city]?.totals?.instagram_photos : countryData?.totals?.instagram_photos;
  const paginationStart = sort === 'asc' ? ((page - 1) * ITEMS_PER_PAGE) : totalPhotos  - ((page - 1) * ITEMS_PER_PAGE);
  
  let instagramHighLights = [];
  let shortVideos = [];
  let youtubeVideos = [];
  let _360photos = [];
  let instagramPhotos = [];

  if (!cache.exists || isRandom) {
    if (isRandom) {
      sort = 'desc';
      
      if (searchParams.indexes) {
        randomArray = searchParams.indexes.split(',').map(i => parseInt(i));
        
        if (randomArray.length > 20) {
          randomArray = [0];
        }
      } else {
        const array = Array.from(Array(totalPhotos).keys());
        randomArray = arrayShuffle(array).slice(0, ITEMS_PER_PAGE);
      }
    }

    if (!cache.exists) {
      if (city) {
        instagramHighLightsSnapshot = await db.collection('countries').doc(country).collection('medias').where('city', '==', city).where('type', '==', 'instagram-highlight').orderBy('order', sort).get();
        shortVideosSnapshot = await db.collection('countries').doc(country).collection('medias').where('city', '==', city).where('type', '==', 'short-video').orderBy('order', sort).get();
        youtubeSnapshot = await db.collection('countries').doc(country).collection('medias').where('city', '==', city).where('type', '==', 'youtube').orderBy('order', sort).get();
        _360PhotosSnapshot = await db.collection('countries').doc(country).collection('medias').where('city', '==', city).where('type', '==', '360photo').orderBy('order', sort).get();
      } else {
        instagramHighLightsSnapshot = await db.collection('countries').doc(country).collection('medias').where('type', '==', 'instagram-highlight').orderBy('city_location_id', sort).orderBy('order', sort).get();
        shortVideosSnapshot = await db.collection('countries').doc(country).collection('medias').where('type', '==', 'short-video').orderBy('city_location_id', sort).orderBy('order', sort).get();
        youtubeSnapshot = await db.collection('countries').doc(country).collection('medias').where('type', '==', 'youtube').orderBy('city_location_id', sort).orderBy('order', sort).get();
        _360PhotosSnapshot = await db.collection('countries').doc(country).collection('medias').where('type', '==', '360photo').orderBy('city_location_id', sort).orderBy('order', sort).get();
      }
    }

    if (city) {
        if (isRandom && totalPhotos > 0) {
        instagramPhotosSnapshot = await db.collection('countries').doc(country).collection('medias').where('type', '==', 'instagram').where('city', '==', city).where('city_index', 'in', randomArray).get();
      } else {
        instagramPhotosSnapshot = await db.collection('countries').doc(country).collection('medias').where('type', '==', 'instagram').where('city', '==', city).orderBy('city_index', sort);
      }
    } else {
      if (isRandom && totalPhotos > 0) {
        instagramPhotosSnapshot = await db.collection('countries').doc(country).collection('medias').where('type', '==', 'instagram').where('country_index', 'in', randomArray).get();
      } else {
        instagramPhotosSnapshot = await db.collection('countries').doc(country).collection('medias').where('type', '==', 'instagram').orderBy('country_index', sort);
      }
    }

    if (!isRandom) {
      if (sort === 'asc') {
        instagramPhotosSnapshot = instagramPhotosSnapshot.startAt(paginationStart);
      } else {
        instagramPhotosSnapshot = instagramPhotosSnapshot.startAfter(paginationStart);
      }
      
      instagramPhotosSnapshot = await instagramPhotosSnapshot.limit(ITEMS_PER_PAGE).get();
    }

    if (!cache.exists) {
      instagramHighLightsSnapshot.forEach((media) => {
        const data = media.data();
        instagramHighLights = [...instagramHighLights, data];
      });

      shortVideosSnapshot.forEach((media) => {
        const data = media.data();
        shortVideos = [...shortVideos, data];
      });

      youtubeSnapshot.forEach((media) => {
        const data = media.data();
        youtubeVideos = [...youtubeVideos, data];
      });

      _360PhotosSnapshot.forEach((media) => {
        const data = media.data();
        _360photos = [..._360photos, data];
      });
    }
    
    if (!cache.exists || isRandom) {
      if (totalPhotos > 0) {
        instagramPhotosSnapshot.forEach((photo) => {
          const data = photo.data();
          instagramPhotos = [...instagramPhotos, data];
        });
      }
    }

    if (!isRandom && !cache.exists) {
      db.doc(cacheRef).set({
        instagramHighLights,
        shortVideos,
        youtubeVideos,
        instagramPhotos,
        _360photos,
        last_update: (new Date().toISOString()).split('T')[0],
      });
    }
  }
  
  if (cache.exists) {
    const cacheData = cache.data();
    instagramHighLights = cacheData.instagramHighLights;
    shortVideos = cacheData.shortVideos;
    youtubeVideos = cacheData.youtubeVideos;
    _360photos = cacheData._360photos;

    if (!isRandom) {
      instagramPhotos = cacheData.instagramPhotos;
    }
  }

  const index = city ? 'city_index' : 'country_index';

  if (isRandom) {
    instagramHighLights = instagramHighLights.map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    shortVideos = shortVideos.map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    youtubeVideos = youtubeVideos.map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    _360photos = _360photos.map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    instagramPhotos = instagramPhotos.sort((a, b) => randomArray.indexOf(a[index]) - randomArray.indexOf(b[index]));
    sort = 'random';
  }

  if (expandGalleries) {
    let expandedList = [];

    instagramPhotos.forEach((item) => {
      expandedList = [...expandedList, item];

      if (item.gallery && item.gallery.length) {
        expandedList = [...expandedList, ...item.gallery.map((g, i) => ({ ...item, ...g, is_gallery: true, img_index: i + 2 }))];
      }
    });
    
    instagramPhotos = expandedList;
  }

  let paginationBase = null;
  const pageNumber = Math.ceil(totalPhotos / ITEMS_PER_PAGE);

  paginationBase = `/countries/${country}${city ? '/cities/' + city : ''}/page/{page}${expandGalleries ? '/expand' : ''}`;
  paginationBase += (sort !== 'desc' ? '?sort=' + sort : '');

  let currentPath = host('/countries/' + countryData.slug);

  const breadcrumbs = [{
    name: i18n('Albums'),
    item: host('/countries'),
  }, {
    name: i18n(countryData.name),
    item: currentPath,
  }];

  if (city) {
    currentPath += '/cities/' + city;
    breadcrumbs.push({ name: isBR && cityData[city].name_pt ? cityData[city].name_pt : cityData[city].name, item: currentPath, });
  }

  if (page && page > 1) {
    currentPath += '/page/' + page;
    breadcrumbs.push({ name: i18n('Page') + ' ' + page, item: currentPath, });
  }

  if (expandGalleries) {
    currentPath += '/expand';

    breadcrumbs.push({ name: i18n('Expand Galleries'), item: currentPath, });
  }

  db.collection('accesses').doc((new Date()).toISOString().split('T')[0]).set({
    [currentPath + ('?sort=' + sort)]: FieldValue.increment(1),
  }, {merge: true});

  let newShuffle = randomIntFromInterval(1, 15);

  if (newShuffle == searchParams.shuffle) {
    newShuffle = randomIntFromInterval(1, 15);
  }
  
  const sortPicker = (type) => (<div className="container-fluid">
      <div className={ styles.sort_picker }>
      <span>{i18n('Sorting')}:</span>

      {[{name: 'Latest', value: 'desc'}, {name: 'Oldest', value: 'asc'}, {name: 'Random', value: 'random'}].map((o) => <Link key={o.value} href={ o.value === 'random' ? sort === 'random' ? paginationBase.split('?')[0].replace('/page/{page}', '') : paginationBase.split('?')[0].replace('/page/{page}', '') + '?sort=random&shuffle=' + newShuffle : o.value !== 'desc' ? '?sort=' + o.value :  paginationBase.split('?')[0].replace('/page/{page}', '') } scroll={false} prefetch={false}><label><input type="radio" name={'sort-' + type } value={o.value} checked={sort === o.value} readOnly />{i18n(o.name)}</label></Link>)}
    </div>

    {isRandom && <div style={{ textAlign: 'center', marginTop: 18 }}>
      <Link href={'?sort=random&shuffle=' + newShuffle} scroll={false} prefetch={false} className="shuffle">
        <button className="btn btn-primary">{i18n('Shuffle')}</button>
      </Link>
    </div>}
  </div>);

  return <div>
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Link href="/countries">
          <img src={host('/images/back.svg')} alt="Back Button" width="30px"></img>
        </Link>

        <ShareButton />
      </div>
    </div>

    <div className="container-fluid">
      <h2>{i18n(countryData.name)} {countryData.flag}</h2>

      <ul className="nav nav-tabs">
        <Link className={ `nav-link${!city ? ' active' : ''}` } aria-current="page" href={ `/countries/${country}${expandGalleries ? '/expand' : ''}` + (sort !== 'desc' ? '?sort=' + sort : '') }>{i18n('All')}</Link>
        {countryData.cities.map(c => <li key={c.slug} className="nav-item">
          <Link className={ `nav-link${city === c.slug ? ' active' : ''}` } aria-current="page" href={ `/countries/${country}/cities/${c.slug}${expandGalleries ? '/expand' : ''}` + (sort !== 'desc' && sort !== 'random' ? '?sort=' + sort : '') } prefetch={false}>{isBR && c.name_pt ? c.name_pt : c.name}</Link>
        </li>)}
      </ul>
    </div>

    { instagramHighLights.length > 1 && sortPicker('highlights') }

    <div className={ styles.galleries }>
      {instagramHighLights.length > 0 && <Scroller title="Instagram Highlights" items={instagramHighLights} isInstagramHighlights cityData={cityData} />}

      { shortVideos.length > 1 && sortPicker('short') }

      { shortVideos.length > 0 && <Scroller title="Short Videos" items={shortVideos} isShortVideos /> }

      { youtubeVideos.length > 1 && sortPicker('youtube') }

      { youtubeVideos.length > 0 && <Scroller title="YouTube Videos" items={youtubeVideos} isYouTubeVideos /> }

      { _360photos.length > 1 && sortPicker('360photos') }

      { _360photos.length > 0 && <Scroller title="360 Photos" items={_360photos} is360Photos /> }

      { instagramPhotos.filter(p => !p.file_type).length > 1 && sortPicker('photos') }

      { instagramPhotos.length > 0 && <div className="container-fluid">
        <div className={ styles.instagram_photos }>
          <div className={ styles.instagram_photos_title }>
            <h3>{i18n('Instagram Posts')}</h3>
            <Link href={ `/countries/${country}${city ? '/cities/' + city : ''}${page ? '/page/' + page : ''}${!expandGalleries ? '/expand' : ''}` + (sort !== 'desc' ? '?sort=' + sort : '') + (sort === 'random' ? '&indexes=' + instagramPhotos.filter(p => !p.file_type).map(p => p[index]).join(',') : '')} scroll={false} prefetch={false}>{expandGalleries ? i18n('Minimize Galleries') : i18n('Expand Galleries')}</Link>
          </div>

          {!isRandom && pageNumber > 1 && <Pagination base={paginationBase} currentPage={Number(page) || 1} pageNumber={pageNumber} total={totalPhotos} textPosition="bottom" />}
          
          <div className={ styles.instagram_highlights_items }>
            {instagramPhotos.map(p => <InstagramMedia key={p.id} media={p} isBR={isBR} expandGalleries={expandGalleries} />)}
          </div>

          {isRandom && <div style={{ textAlign: 'center', marginTop: 30 }}>
            <Link href={'?sort=random&shuffle=' + newShuffle} scroll={false} prefetch={false} className="shuffle">
              <button className="btn btn-primary">{i18n('Shuffle')}</button>
            </Link>
          </div>}

          { !isRandom && pageNumber > 1 && <div style={{ marginTop: 30 }}>
            <Pagination base={paginationBase} currentPage={Number(page) || 1} pageNumber={pageNumber} total={totalPhotos} textPosition="top" />
          </div> }
        </div>
      </div> }
    </div>

    {breadcrumbs.length && <StructuredBreadcrumbs breadcrumbs={breadcrumbs} />}
  </div>
}
