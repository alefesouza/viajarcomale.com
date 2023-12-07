import useHost from '@/app/hooks/use-host';
import { FILE_DOMAIN, SITE_NAME } from '@/app/utils/constants';

export default function WebStories({title, storyTitle, items}) {
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  const firstItem = items[0] || {};
  
  return <amp-story
    standalone
    title={`${title} - Web Stories - ${SITE_NAME}`}
    publisher={SITE_NAME}
    publisher-logo-src={host('/icons/92x92.png')}
    poster-portrait-src={FILE_DOMAIN + firstItem?.file?.replace('.mp4', '-thumb.png')}
  >
    <amp-story-page id="cover" auto-advance-after="1.5s">
      <amp-story-grid-layer template="fill">
        <amp-img src={FILE_DOMAIN + firstItem?.file?.replace('.mp4', '-thumb.png')}
            width={firstItem.width} height={firstItem.height}
            layout="responsive" alt={isBR && firstItem.description_pt ? firstItem.description_pt : firstItem.description}>
        </amp-img>
      </amp-story-grid-layer>
      <amp-story-grid-layer template="vertical">
        <h1 style={{ background: 'rgba(255, 255, 255, .7)', width: 'auto', padding: '2px 10px', borderRadius: '5px', fontWeight: 'bold'}}>{storyTitle}</h1>
        <div style={{ background: 'rgba(255, 255, 255, .7)', width: 'auto', padding: '2px 10px', borderRadius: '5px', fontWeight: 'bold'}}>{SITE_NAME} - @viajarcomale</div>
      </amp-story-grid-layer>
    </amp-story-page>
    {items.map((item) => <amp-story-page key={item.id} id={item.id} auto-advance-after={item.file.includes('.mp4') ? item.id + '-video' : '5s'}>
      <amp-story-grid-layer template="fill">
        {item.file.includes('.mp4') ? <amp-video width={item.width}
            height={item.height}
            layout="responsive"
            poster={FILE_DOMAIN + item.file.replace('.mp4', '-thumb.png')}
            id={item.id + '-video'}
          >
            <source src={FILE_DOMAIN + item.file} type="video/mp4" />
          </amp-video> : <amp-img src={FILE_DOMAIN + item.file.replace('.mp4', '-thumb.png')} width={item.width} height={item.height} layout="responsive" alt={isBR && item.description_pt ? item.description_pt : item.description}></amp-img>}
      </amp-story-grid-layer>
    </amp-story-page>)}
  </amp-story>
}
