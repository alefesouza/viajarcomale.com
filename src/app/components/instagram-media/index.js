import { FILE_DOMAIN, FILE_DOMAIN_500 } from '@/app/utils/constants';
import Hashtags from '../hashtags';
import styles from './index.module.css';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import ShareButton from '../share-button';

export default function InstagramMedia({ media, expandGalleries, isBR, withoutLink, fullQuality }) {
  const host = useHost();

  const mediaElement = media.file_type === 'video' ? <video src={FILE_DOMAIN + media.file + '#t=0.1'} controls /> : <img src={FILE_DOMAIN + media.file} srcSet={ `${(fullQuality ? FILE_DOMAIN : FILE_DOMAIN_500) + media.file} 500w` } alt={isBR ? media.description_pt : media.description} loading="lazy" />;
  const link = host('/countries/' + media.country + '/cities/' + media.city + '/medias/' + media.id);

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

    {!media.is_gallery && <Hashtags hashtags={media.hashtags} />}
  </div>
}
