import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import Link from 'next/link';
import styles from './index.module.css';
import { FILE_DOMAIN, FILE_DOMAIN_500 } from '@/app/utils/constants';
import ShareButton from '../share-button';
import Hashtags from '../hashtags';

export default function Scroller({ title, items, isShortVideos, isInstagramHighlights, isYouTubeVideos, is360Photos, cityData, isStories, webStoriesHref }) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  return (<div>
    <div className={'container-fluid' + (isStories ? ' ' + styles.stories_title : '')}>
      <h3 style={{ marginBlockEnd: is360Photos ? '0em' : '' }}>{i18n(title)}</h3>
      {is360Photos && <div style={{ marginBlockEnd: '1em' }}>{i18n('360 photos are really cool but they are heavy too, it can take up to 1 minute to load.')}</div>}
      {isStories && <a href={webStoriesHref} target="_blank">{i18n('Open in Stories format')}</a>}
    </div>

    <div style={{ position: 'relative' }}>
      <div className={ styles.scroller_left_arrow }>‹</div>

      <div className={ styles.scroller_items } data-scroller>
        {items.map(p => <div key={ p.id } className={ styles.scroller_item + (is360Photos ? ' ' + styles.item_360_photo : '') + (isInstagramHighlights ? ' ' + styles.is_gallery : '') }>
          <a href={isInstagramHighlights ? host('/countries/' + p.country + '/cities/' + p.city + '/highlights/' + p.id) : isShortVideos ? p.tiktok_link : isStories ? host('/countries/' + p.country + '/cities/' + p.city + '/medias/' + p.id) : p.link} target={isInstagramHighlights || isStories ? '_self' : '_blank'} style={{ display: 'block', position: 'relative' }} className={(is360Photos ? styles.item_360_photo : '')}>
            {isStories && p.file.includes('.mp4') ? <img src={FILE_DOMAIN_500 + p.file.replace('.mp4', '-thumb.png')} alt={isBR ? p.description_pt : p.description} className={ styles.video_thumbnail } loading="lazy" /> : <img src={isYouTubeVideos ? p.image : FILE_DOMAIN + p.file} srcSet={ isYouTubeVideos ? p.image : `${FILE_DOMAIN_500 + p.file} 500w, ${FILE_DOMAIN + p.file} ${p.width}w` } sizes={!isYouTubeVideos ? `(max-width: 500px) 500px, ${p.width}px` : ''} alt={isBR ? p.description_pt : p.description} className={!isYouTubeVideos && !is360Photos ? styles.vertical_content : isYouTubeVideos ? styles.youtube_video : ''} loading="lazy" />}

            {(p.file_type === 'video' || p?.file?.includes('.mp4')) && isStories &&
            <div className={ styles.play_button }><img src="/images/play.svg" alt="Play" /></div>}

          </a>

          {isShortVideos && <div className={ styles.short_video_links }>
            {['tiktok', 'instagram', 'youtube', 'kwai'].map((item) => p[item + '_link'] && <a href={p[item + '_link']} target="_blank" key={item}>
              <img src={host('/logos/' + item + '.png')} alt={item + 'Video'} />
            </a>)}
          </div>}

          {isInstagramHighlights && <div className={ styles.external_links }>
            {<a href={host('/countries/' + p.country + '/cities/' + p.city + '/highlights/' + p.id + '/webstories')} target="_blank" title={i18n('Play')}>
              <img src={host('/images/play.svg')} width={32} height={32} alt={i18n('Play')} />
            </a>}

            {<a href={p.link} target="_blank">
              <img src={host('/logos/instagram.png')} alt={i18n('Instagram Icon')} />
            </a>}

            <ShareButton text={isBR && cityData[p.city].name_pt ? cityData[p.city].name_pt : cityData[p.city].name} url={host('/countries/' + p.country + '/cities/' + p.city + '/highlights/' + p.id)} />
          </div>}

          {isStories && <div className={ styles.external_links }>
            {<a href={'https://www.instagram.com/stories/highlights/' + p.highlight.replace('media-highlight-', '') + '/'} target="_blank">
              <img src={host('/logos/instagram.png')} alt={i18n('Instagram Icon')} />
            </a>}

            <ShareButton text={isBR ? p.description_pt : p.description} url={host('/countries/' + p.country + '/cities/' + p.city + '/medias/' + p.id)} />
          </div>}

          {isInstagramHighlights && <div>
            {isBR && cityData[p.city].name_pt ? cityData[p.city].name_pt : cityData[p.city].name}
          </div>}

          {isYouTubeVideos && <div>
            <b>{isBR ? p.title_pt : p.title}</b>
          </div>}

          <div>
            {isBR ? p.description_pt : p.description}
          </div>

          {p.locations && p.location_data && p.location_data[0] && <div style={{marginTop: 4}} className={styles.location}>
            {i18n(p.location_data.length > 1 ? 'Locations' : 'Location')}: {p.location_data.map((location, i) => <><Link href={'/countries/' + p.country + '/cities/' + p.city + '/locations/' + location.slug} key={location.slug}>{location.name}{location.alternative_names && ' (' + location.alternative_names.join(', ') + ')'}</Link>{i < p.location_data.length - 1 ? ', ' : ''}</>)}
          </div>}

          {p.hashtags && p.hashtags.length > 0 && <Hashtags hashtags={isBR && p.hashtags_pt ? p.hashtags_pt : p.hashtags} />}
        </div>)}
      </div>

      <div className={ styles.scroller_right_arrow }>›</div>
    </div>
  </div>)
}
