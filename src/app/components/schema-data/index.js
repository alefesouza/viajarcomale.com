import { FILE_DOMAIN, SITE_NAME } from '@/app/utils/constants';
import { serialize } from 'tinyduration';
import useHost from '@/app/hooks/use-host';
import getMetadata from '@/app/utils/get-metadata';

export default function SchemaData({
  media,
  isWebStories = false,
  isExpand = false,
}) {
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  const { title, description, keywords } = getMetadata(media, isBR);

  const content = (
    <>
      <span itemProp="name" content={title} />
      <span itemProp="description" content={description} />
      <span itemProp="creditText" content={SITE_NAME} />
      <span itemProp="creator" itemScope itemType="http://schema.org/Person">
        <span itemProp="name" content="Alefe Souza"></span>
      </span>
      <span
        itemProp="copyrightNotice"
        content={SITE_NAME + ' - @viajarcomale'}
      />
      <span
        itemProp="uploadDate"
        content={
          media.date
            ? media.date.replace(' ', 'T') + '+03:00'
            : media.cityData.end + 'T12:00:00+03:00'
        }
      />
      <span
        itemProp="license"
        content="https://creativecommons.org/licenses/by-nc/4.0/deed.en"
      />
      <span itemProp="acquireLicensePage" content={host('/contact')} />

      {media.file && media.file.includes('.mp4') && (
        <>
          <span
            itemProp="duration"
            content={serialize({ seconds: Math.ceil(media.duration) })}
          />
          <span
            itemProp="thumbnailUrl"
            content={FILE_DOMAIN + media.file.replace('.mp4', '-thumb.png')}
          />
        </>
      )}
    </>
  );

  const optionalContent = (
    <>
      {media.location_data && media.location_data.length > 0 && (
        <span
          itemProp="contentLocation"
          content={media.location_data
            .map(
              (l) =>
                (isBR && l.name_pt ? l.name_pt : l.name) +
                (l.alternative_names && l.alternative_names.length
                  ? ' (' + l.alternative_names.join(', ') + ')'
                  : '')
            )
            .join(', ')}
        />
      )}
      {keywords && keywords.length > 0 && (
        <span
          itemProp="keywords"
          content={'#' + keywords.filter((l) => l).join(' #')}
        />
      )}
    </>
  );

  if (!isWebStories) {
    return (
      <>
        {isExpand && media.img_index && optionalContent}
        {content}
      </>
    );
  }

  return (
    <div>
      {media.file.includes('.mp4') && optionalContent}
      <span itemProp="contentUrl" content={FILE_DOMAIN + media.file} />
      {content}
    </div>
  );
}
