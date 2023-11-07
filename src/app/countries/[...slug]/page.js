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
import { FILE_DOMAIN, FILE_DOMAIN_500, SITE_NAME } from '@/app/utils/constants';

async function getCountry(db, slug) {
  const routeCountry = countries.find(c => c.slug === slug[0]);

  if (!routeCountry || slug.length > 4) {
    return false;
  }

  const [country, path, city, expand] = slug;

  const countryDoc = await getDoc(doc(db, 'countries', country));
  const countryData = countryDoc.data();

  if (path && ((path === 'cities' && !countryData.cities.find(c => c.slug === city)) || (path !== 'expand' && path !== 'cities')) || (expand && expand !== 'expand')) {
    return false;
  }
  
  return countryData;
}

export async function generateMetadata({ params: { slug } }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();

  const db = getFirestore(app);
  const countryData = await getCountry(db, slug);

  if (!countryData) {
    return {};
  }

  const [country, path, city, expand] = slug;
  let theCity = null;

  if (city) {
    theCity = countryData.cities.find(c => c.slug === city);
  }
 
  return {
    title: (theCity ? theCity.name + ' - ' : '') + countryData.name + ' - ' + i18n('Albums') + ' - ' + SITE_NAME,
  }
}

export default async function Country({ params: { slug }, searchParams }) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  
  const db = getFirestore(app);
  const countryData = await getCountry(db, slug);

  if (!countryData) {
    redirect('/');
  }

  const [country, path, city, expand] = slug;

  const expandGalleries = path === 'expand' || expand;
  let sort = searchParams.sort && ['asc', 'desc', 'random'].includes(searchParams.sort) && searchParams.sort || 'desc';

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

  const sortPicker = <div className={ styles.sort_picker }>
    <span>{i18n('Sorting')}:</span>

    {[{name: 'Latest', value: 'desc'}, {name: 'Oldest', value: 'asc'}, {name: 'Random', value: 'random'}].map((o) => <Link key={o} href={ '?sort=' + o.value } scroll={false}><label><input type="radio" name="sort" value={o.value} checked={sort === o.value} readOnly />{i18n(o.name)}</label></Link>)}
  </div>

  const instagramHighLights = photos.filter(p => p.type === 'instagram-highlight');
  const instagramPhotos = photos.filter(p => p.type === 'instagram' || p.type === 'instagram-gallery');

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
              <img src={FILE_DOMAIN + p.file} srcset={ `${FILE_DOMAIN_500 + p.file} 500w` } alt={p.id} />
            </a>

            <div>
              {slugName[p.city]}
            </div>
          </div>)}
        </div>
      </div>

      {instagramHighLights.length <= 1 && instagramPhotos.length > 1 && sortPicker}

      { instagramPhotos.length > 0 && <div className={ styles.instagram_photos }>
        <div className={ styles.instagram_photos_title }>
          <h4>{i18n('Instagram Photos')}</h4>
          { !expandGalleries ? <Link href={ (city ? `/countries/${country}/cities/${city}/expand` : `/countries/${country}/expand`) + (sort !== 'desc' ? '?sort=' + sort : '')} scroll={false}>{i18n('Expand Galleries')}</Link> : <Link href={ (city ? `/countries/${country}/cities/${city}` : `/countries/${country}`) + (sort !== 'desc' ? '?sort=' + sort : '')} scroll={false}>{i18n('Minimize Galleries')}</Link> }
        </div>
        
        <div className={ styles.instagram_highlights_items }>
          {instagramPhotos.map(p => <div key={ p.file } className={ styles.gallery_item + (p.gallery && p.gallery.length && ! expandGalleries ? ' ' + styles.is_gallery : '' ) }>
            <a href={p.link} target="_blank">
              {p.file_type === 'video' ? <video src={FILE_DOMAIN + p.file} controls /> : <img src={FILE_DOMAIN_500 + p.file} alt={p.id} />}
            </a>

            <div className={ styles.item_description }>
              {isBR ? p.description_pt : p.description}
            </div>

            <div className={ styles.item_hashtags }>
              Hashtags: {p.hashtags.reverse().map(h => <><Link href={`/hashtags/${h}`} key={h}>#{h}</Link> </>)}
            </div>
          </div>)}
        </div>
      </div> }
    </div>

    <div className="container">
      <Footer />
    </div>
  </main>
}
