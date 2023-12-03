import { FILE_DOMAIN, FILE_DOMAIN_500 } from '@/app/utils/constants';
import Hashtags from '../hashtags';
import styles from './index.module.css';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import ShareButton from '../share-button';
import useI18n from '@/app/hooks/use-i18n';

export default function InstagramMedia({ media, expandGalleries, isBR, withoutLink, fullQuality, isMain, hasPoster }) {
  const host = useHost();
  const i18n = useI18n();

  const mediaElement = media.file_type === 'video' || media.file.includes('.mp4') ? <video src={FILE_DOMAIN + media.file + (!hasPoster ? '#t=0.1' : '')} controls poster={hasPoster ? (fullQuality ? FILE_DOMAIN : FILE_DOMAIN_500) + media.file.replace('.mp4', '-thumb.png') : ''} /> : <img src={FILE_DOMAIN + media.file} srcSet={ `${(fullQuality ? FILE_DOMAIN : FILE_DOMAIN_500) + media.file} 500w` } alt={isBR ? media.description_pt : media.description} loading="lazy" />;
  const link = host('/countries/' + media.country + '/cities/' + media.city + '/medias/' + media.id + (isMain ? '/1' : '') + (media.img_index ? '/' + media.img_index : ''));

  return <div key={ media.file } className={ styles.gallery_item + (media.gallery && media.gallery.length && ! expandGalleries ? ' ' + styles.is_gallery : '' ) }>
    {withoutLink ? mediaElement : <Link href={link}>
      {mediaElement}
    </Link>}

    <div className={ styles.external_links }>
      <a href={media.link + (media.img_index ? '?img_index=' + media.img_index : '')} target="_blank">
        <img src={host('/logos/instagram.png')} alt={isBR ? media.description_pt : media.description} />
      </a>
      <ShareButton text={isBR ? media.description_pt : media.description} url={link + (media.img_index ? '/' + media.img_index : '')} />
    </div>

    {!media.is_gallery ? <div>
      {isBR ? media.description_pt : media.description}
    </div> : null}

    {media.location && media.location_data && <div style={{marginTop: 4}} className={styles.location}>
      {i18n('Location')}: <Link href={'/countries/' + media.country + '/cities/' + media.city + '/locations/' + media.location}>{media.location_data.name}{media.location_data.alternative_names && ' (' + media.location_data.alternative_names.join(', ') + ')'}</Link>
    </div>}

    {!media.is_gallery && media.hashtags && media.hashtags.length > 0 && <Hashtags hashtags={media.hashtags} />}
  </div>
}
