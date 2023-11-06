import useI18n from '../../hooks/use-i18n';
import app from '../../firebase';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import { getFirestore, getDocs, collectionGroup, query, where, orderBy } from 'firebase/firestore';
import styles from './page.module.css';
import Top from '@/app/components/top';
import Footer from '@/app/components/footer';
import { FILE_DOMAIN, SITE_NAME } from '@/app/utils/constants';

export async function generateMetadata({ params: { theHashtag } }) {
  return {
    title: '#' + decodeURIComponent(theHashtag[0]) + ' - Hashtags - ' + SITE_NAME,
  }
}

export default async function Country({ params: { theHashtag }, searchParams }) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  const [hashtag, expand] = theHashtag;

  const expandGalleries = expand;
  let order = searchParams.order && ['asc', 'desc', 'random'].includes(searchParams.order) && searchParams.order || 'asc';

  const db = getFirestore(app);
  const photosSnapshot = await getDocs(query(collectionGroup(db, 'medias'), where('hashtags', 'array-contains', decodeURIComponent(hashtag)), orderBy('order', order)));
  let isRandom = order === 'random';

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
    order = 'random';
  }

  const orderPicker = <div className={ styles.order_picker }>
    <span>{i18n('Sorting')}:</span>

    {[{name: 'Latest', value: 'asc'}, {name: 'Oldest', value: 'desc'}, {name: 'Random', value: 'random'}].map((o) => <Link key={o} href={ '?order=' + o.value } scroll={false}><label><input type="radio" name="order" value={o.value} checked={order === o.value} readOnly />{i18n(o.name)}</label></Link>)}
  </div>

  const instagramPhotos = photos.filter(p => p.type === 'instagram' || p.type === 'instagram-gallery');

  return <main className="container-fluid">
    <div className="container">
      <Top />
    </div>

    <h3>#{decodeURIComponent(hashtag)}</h3>

    <div className={ styles.galleries }>
      { instagramPhotos.length > 1 && orderPicker }

      { instagramPhotos.length > 0 && <div className={ styles.instagram_photos }>
        <div className={ styles.instagram_photos_title }>
          <h4>{i18n('Instagram Photos')}</h4>
          { !expandGalleries ? <Link href={ `/hashtags/${hashtag}/expand` + (order !== 'asc' ? '?order=' + order : '')} scroll={false}>{i18n('Expand Galleries')}</Link> : <Link href={ `/hashtags/${hashtag}` + (order !== 'asc' ? '?order=' + order : '')} scroll={false}>{i18n('Minimize Galleries')}</Link> }
        </div>
        
        <div className={ styles.instagram_highlights_items }>
          {instagramPhotos.map(p => <div key={ p.file } className={ styles.gallery_item + (p.gallery && p.gallery.length && ! expandGalleries ? ' ' + styles.is_gallery : '' ) }>
            <a href={p.link} target="_blank">
              {p.file_type === 'video' ? <video src={FILE_DOMAIN + p.file} controls /> : <img src={FILE_DOMAIN + p.file} alt={p.id} />}
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
