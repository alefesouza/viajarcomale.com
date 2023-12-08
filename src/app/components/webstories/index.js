import useI18n from '@/app/hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import { FILE_DOMAIN, FILE_DOMAIN_LANDSCAPE, FILE_DOMAIN_PORTRAIT, FILE_DOMAIN_SQUARE, SITE_NAME } from '@/app/utils/constants';
import { serialize } from 'tinyduration';
import { getFirestore } from 'firebase-admin/firestore';

export default async function WebStories({title, storyTitle, items, highlightItem}) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  const firstItem = highlightItem ? highlightItem : items[0] || {};
  const theCover = firstItem?.file?.replace('.mp4', '-thumb.png');
  
  const textStyles = {
    background: 'rgba(255, 255, 255, .9)',
    width: 'auto',
    padding: '2px 10px',
    borderRadius: '5px',
    fontWeight: 'bold',
    fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Helvetica Neue,Noto Sans,Liberation Sans,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
  }

  const db = getFirestore();
  const countriesSnapshot = await db.collection('countries').get();
  const countries = [];

  countriesSnapshot.forEach((doc) => {
    countries.push(doc.data());
  });

  const getLocation = (country, city) => {
    const theCountry = countries.find(c => c.slug === country);
    const theCity = theCountry.cities.find(c => c.slug === city);

    return [theCountry, theCity]
  }
  
  return <amp-story
    standalone
    title={title}
    publisher={SITE_NAME}
    publisher-logo-src={host('/icons/92x92.png')}
    poster-portrait-src={FILE_DOMAIN_PORTRAIT + theCover}
    poster-landscape-src={FILE_DOMAIN_LANDSCAPE + theCover}
    poster-square-src={FILE_DOMAIN_SQUARE + theCover}
  >
    <amp-story-auto-analytics gtag-id={process.env.NEXT_GA_TRACKING}></amp-story-auto-analytics>
    <amp-story-page id="cover" auto-advance-after="2s">
      <amp-story-grid-layer template="fill">
        <amp-img src={FILE_DOMAIN + theCover}
            width={firstItem.width} height={firstItem.height}
            layout="responsive" alt={isBR && firstItem.description_pt ? firstItem.description_pt : firstItem.description}>
        </amp-img>
      </amp-story-grid-layer>
      <amp-story-grid-layer template="vertical">
        <div style={{...textStyles, fontSize: storyTitle.length > 35 ? 20 : storyTitle.length > 30 ? 24 : 32}}>{storyTitle}</div>
        <div style={{...textStyles, fontSize: 18}}>{SITE_NAME} - @viajarcomale</div>
      </amp-story-grid-layer>
      <amp-story-page-outlink layout="nodisplay">
        <a href="" className="cover-link">{i18n('Open')}</a>
      </amp-story-page-outlink>
    </amp-story-page>
    {items.map((item) => {
      const [countryData, theCity] = getLocation(item.country, item.city);
      
      const description = ((isBR && item.description_pt ? item.description_pt : item.description) || '');
      const shortDescription = description.split(' ').length > 10 ? description.split(' ').slice(0, 10).join(' ') + '…' : description;
      const location = item.location_data && item.location_data.map((c) => c.name).join(', ');
      const hashtags = item.hashtags && item.hashtags.length ? ('Hashtags: ' + (isBR ? item.hashtags_pt : item.hashtags).map((c) => '#' + c).join(', ')) : '';

      const title = (shortDescription ? shortDescription + ' - ' : '') + (location ? location + ' - ' : '') + (isBR && theCity.name_pt ? theCity.name_pt : theCity.name) + ' - ' + i18n(countryData.name) + ' - ' + SITE_NAME;

      return <amp-story-page key={item.id} id={item.id} auto-advance-after={item.file.includes('.mp4') ? item.id + '-video' : '5s'}>
      <amp-story-grid-layer template="fill">
        {item.file.includes('.mp4') ? <amp-video width={item.width}
            height={item.height}
            layout="responsive"
            poster={FILE_DOMAIN + item.file.replace('.mp4', '-thumb.png')}
            id={item.id + '-video'}
            autoplay
            itemScope
            itemType="http://schema.org/VideoObject"
          >
            <source src={FILE_DOMAIN + item.file} type="video/mp4" />

            <meta itemProp="name" content={title} />
            <meta itemProp="description" content={description + (hashtags ? (description ? ' - ' : '') + hashtags : '')}/>
            <meta itemProp="duration" content={serialize({ seconds: parseInt(item.duration) })}/>
            <meta itemProp="thumbnailUrl" content={FILE_DOMAIN + item.file.replace('.mp4', '-thumb.png')}/>
            <meta itemProp="contentUrl" content={FILE_DOMAIN + item.file}/>
            <meta itemProp="uploadDate" content={item.date ? item.date.replace(' ', 'T') + '+03:00' : media.end + 'T12:00:00+03:00'}/>
          </amp-video> :
          <>
            <amp-img src={FILE_DOMAIN + item.file.replace('.mp4', '-thumb.png')} width={item.width} height={item.height} layout="responsive" alt={isBR && item.description_pt ? item.description_pt : item.description} itemprop="image"></amp-img>
          </>}

            {!item.file.includes('.mp4') && <div itemScope itemType="http://schema.org/ImageObject">
              <meta itemProp="creditText" content={SITE_NAME}/>
              <meta itemProp="creator" itemScope itemType="http://schema.org/Person" content="Alefe Souza"/>
              <meta itemProp="copyrightNotice" content={SITE_NAME + ' - @viajarcomale'}/>
              <meta itemProp="contentUrl" content={FILE_DOMAIN + (item.file.includes('.mp4') ? item.file.replace('.mp4', '-thumb.png') : item.file)}/>
            </div>}
          </amp-story-grid-layer>
          <amp-story-grid-layer template="vertical">
            <div style={{...textStyles, color: '#fff', background: 'none', position: 'absolute', top: 18, left: 5}}>@viajarcomale</div>
          </amp-story-grid-layer>
          <amp-story-page-outlink layout="nodisplay">
            <a href={host('/countries/' + item.country + '/cities/' + item.city + '/medias/' + item.id)} target="_blank">{i18n('Open')}</a>
          </amp-story-page-outlink>
        </amp-story-page>
      })}
    <amp-story-bookend src={host('webstories-bookends.json')} layout="nodisplay"></amp-story-bookend>
  </amp-story>
}
