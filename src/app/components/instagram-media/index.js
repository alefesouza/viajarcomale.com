import { FILE_DOMAIN, FILE_DOMAIN_500 } from '@/app/utils/constants';
import Hashtags from '../hashtags';
import styles from './index.module.css';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import ShareButton from '../share-button';
import useI18n from '@/app/hooks/use-i18n';

export default function InstagramMedia({ media, expandGalleries, isBR, withoutLink, fullQuality, isMain, isListing }) {
  const host = useHost();
  const i18n = useI18n();

  const mediaElement = media.file_type === 'video' || media.file.includes('.mp4') ? <>{isListing ? <img src={(fullQuality ? FILE_DOMAIN : FILE_DOMAIN_500) + media.file.replace('.mp4', '-thumb.png')} alt={isBR ? media.description_pt : media.description} loading="lazy" /> : <video src={FILE_DOMAIN + media.file} controls poster={(fullQuality ? FILE_DOMAIN : FILE_DOMAIN_500) + media.file.replace('.mp4', '-thumb.png')} />}</> : <img src={(fullQuality ? FILE_DOMAIN : FILE_DOMAIN_500) + media.file} srcSet={ `${FILE_DOMAIN_500 + media.file} 500w, ${FILE_DOMAIN + media.file} ${media.width}w` } sizes={`(max-width: 500px) 500px, ${media.width}px`} alt={isBR ? media.description_pt : media.description} loading="lazy" />;
  const link = host('/countries/' + media.country + '/cities/' + media.city + '/medias/' + media.id + (isMain ? '/1' : '') + (media.img_index ? '/' + media.img_index : ''));

  return <div key={ media.file } className={ styles.gallery_item + (media.gallery && media.gallery.length && ! expandGalleries ? ' ' + styles.is_gallery : '' ) }>
    {withoutLink ? mediaElement : <Link href={link} style={{ display: 'block' }}>
      {mediaElement}

      {(media.file_type === 'video' || media.file.includes('.mp4')) && isListing &&
      <div className={ styles.play_button }><img src="/images/play.svg" alt="Play" /></div>}
    </Link>}

    <div className={ styles.external_links }>
      <a href={media.link + (media.img_index ? '?img_index=' + media.img_index : '')} target="_blank">
        <img src={host('/logos/instagram.png')} alt={isBR ? media.description_pt : media.description} />
      </a>
      <ShareButton text={isBR ? media.description_pt : media.description} url={link} />
    </div>

    <div>
      {isBR ? media.description_pt : media.description} {(media.img_index ? '- Item ' + media.img_index : '')}
    </div>
    
    {!media.is_gallery && media.locations && media.location_data && media.location_data[0] && <div style={{marginTop: 4}} className={styles.location}>
      {i18n(media.location_data.length > 1 ? 'Locations' : 'Location')}: {media.location_data.map((location, i) => <><Link href={'/countries/' + media.country + '/cities/' + media.city + '/locations/' + location.slug} key={location.slug}>{location.name}{location.alternative_names && ' (' + location.alternative_names.join(', ') + ')'}</Link>{i < media.location_data.length - 1 ? ', ' : ''}</>)}
    </div>}

    {!media.is_gallery && media.hashtags && media.hashtags.length > 0 && <Hashtags hashtags={isBR && media.hashtags_pt ? media.hashtags_pt : media.hashtags} />}
  </div>
}
