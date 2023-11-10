import useI18n from '../../hooks/use-i18n';
import app from '../../firebase';
import { redirect } from 'next/navigation';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import { getFirestore, doc, getDoc, getDocs, collection, query, where, orderBy, limit, startAt, startAfter } from 'firebase/firestore';
import styles from '../page.module.css';
import { FILE_DOMAIN, FILE_DOMAIN_500, ITEMS_PER_PAGE, SITE_NAME } from '@/app/utils/constants';
import Pagination from '@/app/components/pagination';
import StructuredBreadcrumbs from '@/app/components/structured-breadcrumbs';
import arrayShuffle from '@/app/utils/array-shuffle';

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

  const page = path1 === 'page' ? path2 : path3 === 'page' ? path4 : 1;
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

  const countryDoc = await getDoc(doc(db, 'countries', country));
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

  const db = getFirestore(app);
  const countryData = await getCountry(db, slug, searchParams);

  if (!countryData) {
    return {};
  }

  let { city } = getDataFromRoute(slug, searchParams);
  let theCity = null;

  if (city) {
    theCity = countryData.cities.find(c => c.slug === city);
  }

  const title = (theCity ? isBR && theCity.name_pt ? theCity.name_pt + ' - ' : theCity.name + ' - ' : '') + i18n(countryData.name) + ' - ' + i18n('Albums') + ' - ' + SITE_NAME;
 
  return {
    title,
    openGraph: {
      title,
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
  
  const db = getFirestore(app);
  const countryData = await getCountry(db, slug, searchParams);

  if (!countryData) {
    redirect('/');
  }

  let { country, city, page, sort, expandGalleries } = getDataFromRoute(slug, searchParams);

  let instagramHighLightsSnapshot = null;
  let shortVideosSnapshot = null;
  let instagramPhotosSnapshot = null;
  let isRandom = sort === 'random';
  let randomArray = [];

  const cityData = countryData.cities.reduce((prev, curr, i) => {
    prev[curr.slug] = curr;

    return prev;
  }, {});

  const totalPhotos = city ? cityData[city]?.totals?.instagram_photos : countryData?.totals?.instagram_photos;
  const paginationStart = sort === 'asc' ? ((page - 1) * ITEMS_PER_PAGE) : totalPhotos  - ((page - 1) * ITEMS_PER_PAGE);

  let shuffle = parseFloat( searchParams.shuffle );
  
  if (isRandom) {
    sort = 'desc';
    let shuffle = parseFloat( searchParams.shuffle );
    shuffle = isNaN(shuffle) ? Math.random() : shuffle;
    
    const array = Array.from(Array(totalPhotos).keys());
    randomArray = arrayShuffle(array, shuffle).slice(0, ITEMS_PER_PAGE);
  }

  if (city) {
    instagramHighLightsSnapshot = await getDocs(query(collection(db, 'countries', country, 'medias'), where('city', '==', city), where('type', '==', 'instagram-highlight'), orderBy('order', sort)));
    shortVideosSnapshot = await getDocs(query(collection(db, 'countries', country, 'medias'), where('city', '==', city), where('type', '==', 'short-video'), orderBy('order', sort)));

    if (isRandom) {
      instagramPhotosSnapshot = await getDocs(query(collection(db, 'countries', country, 'medias'), where('type', '==', 'instagram'), where('city', '==', city), where('city_index', 'in', randomArray)));
    } else {
      instagramPhotosSnapshot = await getDocs(query(collection(db, 'countries', country, 'medias'), where('type', '==', 'instagram'), where('city', '==', city), orderBy('city_index', sort), sort === 'asc' ? startAt(paginationStart) : startAfter(paginationStart), limit(ITEMS_PER_PAGE)));
    }
  } else {
    instagramHighLightsSnapshot = await getDocs(query(collection(db, 'countries', country, 'medias'), where('type', '==', 'instagram-highlight'), orderBy('city_location_id', sort), orderBy('order', sort)));
    shortVideosSnapshot = await getDocs(query(collection(db, 'countries', country, 'medias'), where('type', '==', 'short-video'), orderBy('city_location_id', sort), orderBy('order', sort)));

    if (isRandom) {
      instagramPhotosSnapshot = await getDocs(query(collection(db, 'countries', country, 'medias'), where('type', '==', 'instagram'), where('country_index', 'in', randomArray)));
    } else {
      instagramPhotosSnapshot = await getDocs(query(collection(db, 'countries', country, 'medias'), where('type', '==', 'instagram'), orderBy('country_index', sort), sort === 'asc' ? startAt(paginationStart) : startAfter(paginationStart), limit(ITEMS_PER_PAGE)));
    }
  }

  let instagramHighLights = [];
  let shortVideos = [];
  let instagramPhotos = [];

  instagramHighLightsSnapshot.forEach((media) => {
    const data = media.data();
    instagramHighLights = [...instagramHighLights, data];
  });

  shortVideosSnapshot.forEach((media) => {
    const data = media.data();
    shortVideos = [...shortVideos, data];
  });
  
  instagramPhotosSnapshot.forEach((photo) => {
    const data = photo.data();
    instagramPhotos = [...instagramPhotos, data];

    if (expandGalleries && data.gallery) {
      instagramPhotos = [...instagramPhotos, ...data.gallery.map(g => ({ ...data, ...g }))];
    }
  });

  if (isRandom) {
    instagramHighLights = instagramHighLights.map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    shortVideos = shortVideos.map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    const index = city ? 'city_index' : 'country_index';
    instagramPhotos = instagramPhotos.sort((a, b) => randomArray.indexOf(a[index]) - randomArray.indexOf(b[index]));
    sort = 'random';
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
    breadcrumbs.push({ name: i18n(cityData[city].name), item: currentPath, });
  }

  if (page) {
    currentPath += '/page/' + page;
    breadcrumbs.push({ name: i18n('Page') + ' ' + page, item: currentPath, });
  }

  if (expandGalleries) {
    currentPath += '/expand';

    breadcrumbs.push({ name: i18n('Expand Galleries'), item: currentPath, });
  }

  const sortPicker = (type) => (<div className="container-fluid">
      <div className={ styles.sort_picker }>
      <span>{i18n('Sorting')}:</span>

      {[{name: 'Latest', value: 'desc'}, {name: 'Oldest', value: 'asc'}, {name: 'Random', value: 'random'}].map((o) => <Link key={o.value} href={ o.value === 'random' ? paginationBase.split('?')[0].replace('/page/{page}', '') + '?sort=random' : '?sort=' + o.value } scroll={false} prefetch={false}><label><input type="radio" name={'sort-' + type } value={o.value} checked={sort === o.value} readOnly />{i18n(o.name)}</label></Link>)}
    </div>

    {isRandom && <div style={{ textAlign: 'center' }}>
      <Link href={'?sort=random&shuffle=' + Math.random()} scroll={false} prefetch={false}>
        <button className="btn btn-primary">{i18n('Shuffle')}</button>
      </Link>
    </div>}
  </div>);

  return <div>
    <div className="container">
      <Link href="/countries">
        <img src={host('/images/back.svg')} alt="Back Button" width="30px"></img>
      </Link>
    </div>

    <div className="container-fluid">
      <h3>{i18n(countryData.name)} {countryData.flag}</h3>

      <ul className="nav nav-tabs">
        <Link className={ `nav-link${!city ? ' active' : ''}` } aria-current="page" href={ `/countries/${country}${expandGalleries ? '/expand' : ''}` + (sort !== 'desc' ? '?sort=' + sort : '') }>{i18n('All')}</Link>
        {countryData.cities.map(c => <li key={c.slug} className="nav-item">
          <Link className={ `nav-link${city === c.slug ? ' active' : ''}` } aria-current="page" href={ `/countries/${country}/cities/${c.slug}${expandGalleries ? '/expand' : ''}` + (sort !== 'desc' ? '?sort=' + sort : '') } prefetch={false}>{isBR && c.name_pt ? c.name_pt : c.name}</Link>
        </li>)}
      </ul>
    </div>

    { instagramHighLights.length > 1 && sortPicker('highlights') }

    <div className={ styles.galleries }>
      {instagramHighLights.length > 0 && <div className={ styles.instagram_highlights }>
        <div className="container-fluid">
          <h4>{i18n('Instagram Highlights')}</h4>
        </div>

        <div style={{ position: 'relative' }}>
          <div className="scroller_left_arrow">‹</div>

          <div className="scroller_items">
            {instagramHighLights.map(p => <div key={ p.id } className="scroller_item">
              <a href={p.link} target="_blank">
                <img src={FILE_DOMAIN + p.file} srcSet={ `${FILE_DOMAIN_500 + p.file} 500w` } alt={i18n(cityData[p.city].name)} className={styles.vertical_content} />
              </a>

              <div>
                {i18n(cityData[p.city].name)}
              </div>
            </div>)}
          </div>

          <div className="scroller_right_arrow">›</div>
        </div>
      </div>}

      { shortVideos.length > 1 && sortPicker('short') }

      {shortVideos.length > 0 && <div className={ styles.instagram_highlights }>
        <div className="container-fluid">
          <h4>{i18n('Short Videos')}</h4>
        </div>

        <div style={{ position: 'relative' }}>
          <div className="scroller_left_arrow">‹</div>

          <div className="scroller_items">
            {shortVideos.map(p => <div key={ p.id } className="scroller_item">
              <a href={p.tiktok_link} target="_blank">
                <img src={FILE_DOMAIN + p.file} srcSet={ `${FILE_DOMAIN_500 + p.file} 500w` } alt={isBR ? p.description_pt : p.description} className={styles.vertical_content} />
              </a>

              <div className={ styles.short_video_links }>
                {['tiktok', 'instagram', 'youtube', 'kwai'].map((item) => p[item + '_link'] && <a href={p[item + '_link']} target="_blank" key={item}>
                  <img src={host('/logos/' + item + '.png')} alt={item + 'Video'} />
                </a>)}
              </div>

              <div>
                {isBR ? p.description_pt : p.description}
              </div>

              {p.hashtags && <div className={ styles.item_hashtags }>
                Hashtags: {p.hashtags.reverse().map(h => <span key={h}><Link href={`/hashtags/${h}`} key={h} prefetch={false}>#{h}</Link> </span>)}
              </div>}
            </div>)}
          </div>

          <div className="scroller_right_arrow">›</div>
        </div>
      </div>}

      { instagramPhotos.length > 1 && sortPicker('photos') }

      { instagramPhotos.length > 0 && <div className="container-fluid">
        <div className={ styles.instagram_photos }>
          <div className={ styles.instagram_photos_title }>
            <h4>{i18n('Instagram Photos')}</h4>
            <Link href={ `/countries/${country}${city ? '/cities/' + city : ''}${page ? '/page/' + page : ''}${!expandGalleries ? '/expand' : ''}` + (sort !== 'desc' ? '?sort=' + sort : '') + (sort === 'random' && !isNaN(shuffle) ? '&shuffle=' + shuffle : '')} scroll={false} prefetch={false}>{expandGalleries ? i18n('Minimize Galleries') : i18n('Expand Galleries')}</Link>
          </div>

          {!isRandom && pageNumber > 1 && <Pagination base={paginationBase} currentPage={Number(page) || 1} pageNumber={pageNumber} total={totalPhotos} textPosition="bottom" />}
          
          <div className={ styles.instagram_highlights_items }>
            {instagramPhotos.map(p => <div key={ p.file } className={ styles.gallery_item + (p.gallery && p.gallery.length && ! expandGalleries ? ' ' + styles.is_gallery : '' ) }>
              <a href={p.link} target="_blank">
                {p.file_type === 'video' ? <video src={FILE_DOMAIN + p.file} controls /> : <img src={FILE_DOMAIN_500 + p.file} alt={isBR ? p.description_pt : p.description} />}
              </a>

              <div className={ styles.item_description }>
                {isBR ? p.description_pt : p.description}
              </div>

              {!p.file_type && <div className={ styles.item_hashtags }>
                Hashtags: {p.hashtags.reverse().map(h => <span key={h}><Link href={`/hashtags/${h}`} prefetch={false}>#{h}</Link> </span>)}
              </div>}
            </div>)}
          </div>

          {isRandom && <div style={{ textAlign: 'center', marginTop: 30 }}>
            <Link href={'?sort=random&shuffle=' + Math.random()} scroll={false} prefetch={false}>
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
