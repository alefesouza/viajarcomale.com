import { FILE_DOMAIN, SITE_NAME } from '@/app/utils/constants';
import { serialize } from 'tinyduration';
import useHost from '@/app/hooks/use-host';

export default function SchemaData({ media, title, isVideo, description, keywords, isWebStories = false }) {
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  
  const content = <>
    <span itemProp="creditText" content={SITE_NAME}/>
    <span itemProp="creator" itemScope itemType="http://schema.org/Person">
      <span itemProp="name" content="Alefe Souza"></span>
    </span>
    <span itemProp="copyrightNotice" content={SITE_NAME + ' - @viajarcomale'}/>
    <span itemProp="uploadDate" content={media.date.replace(' ', 'T') + '+03:00'}/>
    <span itemProp="license" content="https://creativecommons.org/licenses/by-nc/4.0/deed.en"/>
    <span itemProp="acquireLicensePage" content={host('/contact')}/>

    {isVideo && <>
      <span itemProp="name" content={title} />
      <span itemProp="duration" content={serialize({ seconds: parseInt(media.duration) })}/>
      <span itemProp="thumbnailUrl" content={FILE_DOMAIN + media.file.replace('.mp4', '-thumb.png')}/>
    </>}
  </>

  if (!isWebStories) {
    return content;
  }

  return <div>
    {media.file.includes('.mp4') && <>
      <span itemProp="description" content={description}/>
      {media.location_data && media.location_data.length && <span itemProp="contentLocation" content={media.location_data.map(l => (isBR && l.name_pt ? l.name_pt : l.name) + (l.alternative_names && l.alternative_names.length ? ' (' + l.alternative_names.join(', ') + ')' : '')).join(', ')}/>}
      {keywords && keywords.length && <span itemProp="keywords" content={'#' + keywords.filter(l => l).join(' #')}/>}
    </>}
    <span itemProp="contentUrl" content={FILE_DOMAIN + media.file}/>
    {content}
  </div>
}
