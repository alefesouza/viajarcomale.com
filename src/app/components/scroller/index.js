import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import Link from 'next/link';
import styles from './index.module.css';
import { FILE_DOMAIN, FILE_DOMAIN_500 } from '@/app/utils/constants';

export default function Scroller({ title, items, isShortVideos, isInstagramHighlights, isYouTubeVideos, is360Photos, cityData }) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  return (<div>
    <div className="container-fluid">
      <h3>{i18n(title)}</h3>
    </div>

    <div style={{ position: 'relative' }}>
      <div className={ styles.scroller_left_arrow }>‹</div>

      <div className={ styles.scroller_items } data-scroller>
        {items.map(p => <div key={ p.id } className={ styles.scroller_item + (is360Photos ? ' ' + styles.item_360_photo : '') }>
          <a href={isShortVideos ? p.tiktok_link : p.link} target="_blank">
            <img src={isYouTubeVideos ? p.image : FILE_DOMAIN + p.file} srcSet={ isYouTubeVideos ? p.image : `${FILE_DOMAIN_500 + p.file} 500w` } alt={isBR ? p.description_pt : p.description} className={!isYouTubeVideos && !is360Photos ? styles.vertical_content : isYouTubeVideos ? styles.youtube_video : ''} loading="lazy" />
          </a>

          {isShortVideos && <div className={ styles.short_video_links }>
            {['tiktok', 'instagram', 'youtube', 'kwai'].map((item) => p[item + '_link'] && <a href={p[item + '_link']} target="_blank" key={item}>
              <img src={host('/logos/' + item + '.png')} alt={item + 'Video'} />
            </a>)}
          </div>}

          {isInstagramHighlights && <div>
            {i18n(cityData[p.city].name)}
          </div>}

          {isYouTubeVideos && <div>
            <b>{isBR ? p.title_pt : p.title}</b>
          </div>}

          <div>
            {isBR ? p.description_pt : p.description}
          </div>

          {p.hashtags && <div className={ styles.item_hashtags }>
            Hashtags: {p.hashtags.reverse().map(h => <span key={h}><Link href={`/hashtags/${h}`} key={h} prefetch={false}>#{h}</Link> </span>)}
          </div>}
        </div>)}
      </div>

      <div className={ styles.scroller_right_arrow }>›</div>
    </div>
  </div>)
}
