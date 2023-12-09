import { FILE_DOMAIN, SITE_NAME } from '@/app/utils/constants';
import { serialize } from 'tinyduration';

export default function SchemaData({ media, title, isVideo, description, fallbackDate, keywords, withItemType = false }) {
  const content = <>
    <span itemProp="creditText" content={SITE_NAME}/>
    <span itemProp="creator" itemScope itemType="http://schema.org/Person">
      <span itemProp="name" content="Alefe Souza"></span>
    </span>
    <span itemProp="copyrightNotice" content={SITE_NAME + ' - @viajarcomale'}/>
    {withItemType && <span itemProp="contentUrl" content={FILE_DOMAIN + (media.file.includes('.mp4') ? media.file.replace('.mp4', '-thumb.png') : media.file)}/>}
    <span itemProp="uploadDate" content={media.date ? media.date.replace(' ', 'T') + '+03:00' : fallbackDate + 'T12:00:00+03:00'}/>

    {isVideo && <>
      <span itemProp="name" content={title} />
      <span itemProp="duration" content={serialize({ seconds: parseInt(media.duration) })}/>
      <span itemProp="thumbnailUrl" content={FILE_DOMAIN + media.file.replace('.mp4', '-thumb.png')}/>
    </>}
  </>

  if (!withItemType) {
    return content;
  }

  return <div itemScope itemType={isVideo ? 'http://schema.org/VideoObject' : 'http://schema.org/ImageObject'}>
    {media.file.includes('.mp4') && <>
      <span itemProp="description" content={description}/>
      {media.location_data && <span itemProp="contentLocation" content={media.location_data.map(l => l.name).join(', ')}/>}
      {keywords && keywords.length && <span itemProp="keywords" content={'#' + keywords.map(l => l).join(' #')}/>}
      <span itemProp="contentUrl" content={FILE_DOMAIN + media.file}/>
    </>}
    {content}
  </div>
}
