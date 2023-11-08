import countries from '../../utils/countries';
import useI18n from '../../hooks/use-i18n';
import app from '../../firebase';
import { redirect } from 'next/navigation';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import { getFirestore, doc, getDoc, getDocs, collection, query, where, orderBy } from 'firebase/firestore';
import styles from '../page.module.css';
import Top from '@/app/components/top';
import Footer from '@/app/components/footer';
import { FILE_DOMAIN, FILE_DOMAIN_500, ITEMS_PER_PAGE, SITE_NAME } from '@/app/utils/constants';
import Pagination from '@/app/components/pagination';

function getDataFromRoute(slug, searchParams) {
  const [country, path1, path2, path3, path4, path5] = slug;
  // {country}
  // {country}/page/{page}
  // {country}/expand
  // {country}/expand/page/{page}
  // {country}/cities/{city}
  // {country}/cities/{city}/page/{page}
  // {country}/cities/{city}/expand/page/{page}

  let city = null;

  if (path1 === 'cities') {
    city = path2;
  }

  const page = path1 === 'page' ? path2 : path2 === 'page' ? path3 : path3 === 'page' ? path4 : path4 === 'page' ? path5 : null;
  const expandGalleries = path1 === 'expand' || path3 === 'expand';
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

  let photosSnapshot = null;
  let isRandom = sort === 'random';

  if (isRandom) {
    sort = 'desc';
  }

  if (city) {
    photosSnapshot = await getDocs(query(collection(db, 'countries', country, 'medias'), where('city', '==', city), orderBy('order', sort)));
  } else {
    photosSnapshot = await getDocs(query(collection(db, 'countries', country, 'medias'), orderBy('order', sort)));
  }

  let photos = [];

  photosSnapshot.forEach((photo) => {
    const data = photo.data();

    photos = [...photos, data];

    if (expandGalleries && data.gallery) {
      photos = [...photos, ...data.gallery.map(g => ({ ...data, ...g }))];
    }
  });

  if (isRandom) {
    photos = photos.map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    sort = 'random';
  }

  const slugName = countryData.cities.reduce((prev, curr) => {
    prev[curr.slug] = curr.name;

    return prev;
  }, {});

  const instagramHighLights = photos.filter(p => p.type === 'instagram-highlight');
  let allInstagramPhotos = photos.filter(p => p.type === 'instagram' || p.type === 'instagram-gallery');
  let instagramPhotos = [];

  // I've preferred not to use Firestore pagination because
  // we cannot show the total and would need two queries to show
  // other data too.
  if (page) {
    instagramPhotos = allInstagramPhotos.slice((page - 1) * 20, (page - 1) * 20 + 20);
  } else {
    instagramPhotos = allInstagramPhotos.slice(0, 20);
  }

  if (isRandom) {
    instagramPhotos = allInstagramPhotos;
  }

  let paginationBase = null;
  const pageNumber = Math.ceil(allInstagramPhotos.length / ITEMS_PER_PAGE);

  if (city) {
    paginationBase = `/countries/${country}/cities/${city}/page/{page}`;
  } else {
    paginationBase = `/countries/${country}/page/{page}`;
  }

  if (expandGalleries) {
    if (city) {
      paginationBase = `/countries/${country}/cities/${city}/expand/page/{page}`;
    } else {
      paginationBase = `/countries/${country}/expand/page/{page}`;
    }
  }

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
    breadcrumbs.push({ name: i18n(slugName[city]), item: currentPath, });
  }

  if (expandGalleries) {
    currentPath += '/expand';

    breadcrumbs.push({ name: i18n('Expand Galleries'), item: currentPath, });
  }

  if (page) {
    currentPath += '/page/' + page;
    breadcrumbs.push({ name: i18n('Page') + ' ' + page, item: currentPath, });
  }

  const sortPicker = <div className={ styles.sort_picker }>
    <span>{i18n('Sorting')}:</span>

    {[{name: 'Latest', value: 'desc'}, {name: 'Oldest', value: 'asc'}, {name: 'Random', value: 'random'}].map((o) => <Link key={o} href={ o.value === 'random' ? paginationBase.split('?')[0].replace('/page/{page}', '') + '?sort=random' : '?sort=' + o.value } scroll={false}><label><input type="radio" name="sort" value={o.value} checked={sort === o.value} readOnly />{i18n(o.name)}</label></Link>)}
  </div>

  return <main className="container-fluid">
    <div className="container">
      <Top />

      <Link href="/countries">
        <img src={host('/images/back.svg')} alt="Back Button" width="30px"></img>
      </Link>
    </div>

    <h3>{i18n(country.name)}</h3>

    <ul className="nav nav-tabs">
      <Link className={ `nav-link${!city ? ' active' : ''}` } aria-current="page" href={ `/countries/${country}${expandGalleries ? '/expand' : ''}` + (sort !== 'desc' ? '?sort=' + sort : '') }>{i18n('All')}</Link>
      {countryData.cities.map(c => <li key={c.slug} className="nav-item">
        <Link className={ `nav-link${city === c.slug ? ' active' : ''}` } aria-current="page" href={ `/countries/${country}/cities/${c.slug}${expandGalleries ? '/expand' : ''}` + (sort !== 'desc' ? '?sort=' + sort : '') }>{isBR && c.name_pt ? c.name_pt : c.name}</Link>
      </li>)}
    </ul>

    {instagramHighLights.length > 1 && sortPicker}

    <div className={ styles.galleries }>
      <div className={ styles.instagram_highlights }>
        <h4>{i18n('Instagram Highlights')}</h4>

        <div className={ styles.instagram_highlights_items }>
          {instagramHighLights.map(p => <div key={ p.id } className={ styles.gallery_item }>
            <a href={p.link} target="_blank">
              <img src={FILE_DOMAIN + p.file} srcSet={ `${FILE_DOMAIN_500 + p.file} 500w` } alt={i18n(slugName[p.city])} />
            </a>

            <div>
              {i18n(slugName[p.city])}
            </div>
          </div>)}
        </div>
      </div>

      { instagramHighLights.length <= 1 && allInstagramPhotos.length > 1 && sortPicker }

      { allInstagramPhotos.length > 0 && <div className={ styles.instagram_photos }>
        <div className={ styles.instagram_photos_title }>
          <h4>{i18n('Instagram Photos')}</h4>
          { !expandGalleries ? <Link href={ (city ? `/countries/${country}/cities/${city}/expand` : `/countries/${country}/expand`) + (sort !== 'desc' ? '?sort=' + sort : '')} scroll={false}>{i18n('Expand Galleries')}</Link> : <Link href={ (city ? `/countries/${country}/cities/${city}` : `/countries/${country}`) + (sort !== 'desc' ? '?sort=' + sort : '')} scroll={false}>{i18n('Minimize Galleries')}</Link> }
        </div>

        {!isRandom && pageNumber > 1 && <Pagination base={paginationBase} currentPage={Number(page) || 1} pageNumber={pageNumber} total={allInstagramPhotos.length} textPosition="bottom" />}
        
        <div className={ styles.instagram_highlights_items }>
          {instagramPhotos.map(p => <div key={ p.file } className={ styles.gallery_item + (p.gallery && p.gallery.length && ! expandGalleries ? ' ' + styles.is_gallery : '' ) }>
            <a href={p.link} target="_blank">
              {p.file_type === 'video' ? <video src={FILE_DOMAIN + p.file} controls /> : <img src={FILE_DOMAIN_500 + p.file} alt={isBR ? p.description_pt : p.description} />}
            </a>

            <div className={ styles.item_description }>
              {isBR ? p.description_pt : p.description}
            </div>

            <div className={ styles.item_hashtags }>
              Hashtags: {p.hashtags.reverse().map(h => <span key={h}><Link href={`/hashtags/${h}`} key={h}>#{h}</Link> </span>)}
            </div>
          </div>)}
        </div>

        { !isRandom && pageNumber > 1 && <div style={{ marginTop: 30 }}>
          <Pagination base={paginationBase} currentPage={Number(page) || 1} pageNumber={pageNumber} total={allInstagramPhotos.length} textPosition="top" />
        </div> }
      </div> }
    </div>

    <div className="container">
      <Footer breadcrumbs={breadcrumbs} />
    </div>
  </main>
}
