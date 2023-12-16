import useI18n from '@/app/hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import { FILE_DOMAIN, FILE_DOMAIN_LANDSCAPE, FILE_DOMAIN_PORTRAIT, FILE_DOMAIN_SQUARE, SITE_NAME } from '@/app/utils/constants';
import SchemaData from '../schema-data';
import getMetadata from '@/app/utils/get-metadata';

export default async function WebStories({title, storyTitle, items, highlightItem}) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  const firstItem = highlightItem ? highlightItem : items[0] || {};
  const theCover = firstItem?.file?.replace('.mp4', '-thumb.png');
  
  const textStyles = {
    background: '#ffffff',
    width: 'auto',
    padding: '2px 10px',
    borderRadius: '5px',
    fontWeight: 'bold',
    fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Helvetica Neue,Noto Sans,Liberation Sans,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
    WebkitBoxDecorationBreak: 'clone',
    boxDecorationBreak: 'clone',
    display: 'inline',
    paddingBottom: 5,
  }

  const needSplit = storyTitle.split(' ').length == 1;

  return <amp-story
    standalone
    title={title}
    publisher={SITE_NAME}
    publisher-logo-src={host('/icons/96x96.png')}
    poster-portrait-src={FILE_DOMAIN_PORTRAIT + theCover}
    poster-landscape-src={FILE_DOMAIN_LANDSCAPE + theCover}
    poster-square-src={FILE_DOMAIN_SQUARE + theCover}
  >
    <amp-story-page id="cover" auto-advance-after="2s">
      <amp-story-grid-layer template="fill">
        <amp-img src={FILE_DOMAIN + theCover}
            width={firstItem.width} height={firstItem.height}
            layout="responsive" alt={isBR && firstItem.description_pt ? firstItem.description_pt : firstItem.description} style={{ filter: 'brightness(70%)' }}>
        </amp-img>
      </amp-story-grid-layer>
      <amp-story-grid-layer template="vertical">
        <amp-img src={host('/icons/96x96.png')} width={96} height={96}></amp-img>
        <div style={{ width: '100%', marginLeft: 6, marginRight: 6, }}>
          <h1 style={{...textStyles, fontSize: storyTitle.length && needSplit > 35 ? 20 : storyTitle.length && needSplit > 30 ? 24 : 32}}>{storyTitle}</h1>
        </div>
      </amp-story-grid-layer>
      <amp-story-page-outlink layout="nodisplay">
        <a href="" className="cover-link">{i18n('Open')}</a>
      </amp-story-page-outlink>
    </amp-story-page>
    {items.map((item) => {
      const { description } = getMetadata(item, isBR);

      return <amp-story-page key={item.id} id={item.id} auto-advance-after={item.file.includes('.mp4') ? item.id + '-video' : '5s'} itemScope itemType={item.file.includes('.mp4') ? 'http://schema.org/VideoObject' : 'http://schema.org/ImageObject'}>
      <amp-story-grid-layer template="fill">
        {item.file.includes('.mp4') ? <amp-video width={item.width}
            height={item.height}
            layout="responsive"
            poster={FILE_DOMAIN + item.file.replace('.mp4', '-thumb.png')}
            id={item.id + '-video'}
            autoplay
            cache="google"
          >
            <source src={FILE_DOMAIN + item.file} type="video/mp4" />
          </amp-video> :
          <>
            <amp-img src={FILE_DOMAIN + item.file.replace('.mp4', '-thumb.png')} width={item.width} height={item.height} layout="responsive" alt={description}></amp-img>
          </>}

          <SchemaData media={item} isWebStories={true} />
        </amp-story-grid-layer>
        <amp-story-grid-layer template="vertical">
          <div style={{...textStyles, color: '#fff', background: 'none', position: 'absolute', top: 18, left: 5}}>@viajarcomale</div>
        </amp-story-grid-layer>
        <amp-story-page-outlink layout="nodisplay">
          <a href={host('/countries/' + item.country + '/cities/' + item.city + '/medias/' + item.id)} target="_blank">{i18n('Open')}</a>
        </amp-story-page-outlink>
      </amp-story-page>
    })}
    <amp-story-auto-analytics gtag-id={process.env.NEXT_GA_TRACKING}></amp-story-auto-analytics>
  </amp-story>
}
