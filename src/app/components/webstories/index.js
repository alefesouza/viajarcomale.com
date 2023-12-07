import useHost from '@/app/hooks/use-host';
import { FILE_DOMAIN, SITE_NAME } from '@/app/utils/constants';

export default function WebStories({title, storyTitle, items, cover}) {
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  const firstItem = items[0] || {};
  const theCover = cover || FILE_DOMAIN + firstItem?.file?.replace('.mp4', '-thumb.png');

  const textStyles = {
    background: 'rgba(255, 255, 255, .7)',
    width: 'auto',
    padding: '2px 10px',
    borderRadius: '5px',
    fontWeight: 'bold',
    fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Helvetica Neue,Noto Sans,Liberation Sans,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
  }
  
  return <amp-story
    standalone
    title={title}
    publisher={SITE_NAME}
    publisher-logo-src={host('/icons/92x92.png')}
    poster-portrait-src={theCover}
  >
    <amp-story-auto-analytics gtag-id={process.env.NEXT_GA_TRACKING}></amp-story-auto-analytics>
    <amp-story-page id="cover" auto-advance-after="1.5s">
      <amp-story-grid-layer template="fill">
        <amp-img src={theCover}
            width={firstItem.width} height={firstItem.height}
            layout="responsive" alt={isBR && firstItem.description_pt ? firstItem.description_pt : firstItem.description}>
        </amp-img>
      </amp-story-grid-layer>
      <amp-story-grid-layer template="vertical">
        <h1 style={textStyles}>{storyTitle}</h1>
        <div style={textStyles}>{SITE_NAME} - @viajarcomale</div>
      </amp-story-grid-layer>
    </amp-story-page>
    {items.map((item) => <amp-story-page key={item.id} id={item.id} auto-advance-after={item.file.includes('.mp4') ? item.id + '-video' : '5s'}>
      <amp-story-grid-layer template="fill">
        {item.file.includes('.mp4') ? <amp-video width={item.width}
            height={item.height}
            layout="responsive"
            poster={FILE_DOMAIN + item.file.replace('.mp4', '-thumb.png')}
            id={item.id + '-video'}
            autoplay
          >
            <source src={FILE_DOMAIN + item.file} type="video/mp4" />
          </amp-video> : <amp-img src={FILE_DOMAIN + item.file.replace('.mp4', '-thumb.png')} width={item.width} height={item.height} layout="responsive" alt={isBR && item.description_pt ? item.description_pt : item.description}></amp-img>}
      </amp-story-grid-layer>
      <amp-story-grid-layer template="vertical">
        <div style={{...textStyles, color: '#fff', background: 'none', position: 'absolute', top: 18, left: 5}}>@viajarcomale</div>
      </amp-story-grid-layer>
    </amp-story-page>)}
    <amp-story-bookend src={host('webstories-bookends.json')} layout="nodisplay"></amp-story-bookend>
  </amp-story>
}
