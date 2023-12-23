import { FILE_DOMAIN, FILE_DOMAIN_500 } from '@/app/utils/constants';
import Hashtags from '../hashtags';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import ShareButton from '../share-button';
import useI18n from '@/app/hooks/use-i18n';
import SchemaData from '../schema-data';

export default function InstagramMedia({
  media,
  expandGalleries,
  isBR,
  withoutLink,
  fullQuality,
  isMain,
  isListing,
}) {
  const host = useHost();
  const i18n = useI18n();

  if (media.id.startsWith('story-')) {
    const split = media.id.split('-');
    media.id = split[split.length - 1];
  } else {
    media.id = media.id.replace('media-', '');
  }

  const mediaElement =
    media.file_type === 'video' || media.file.includes('.mp4') ? (
      <>
        {isListing ? (
          <img
            src={
              (fullQuality ? FILE_DOMAIN : FILE_DOMAIN_500) +
              media.file.replace('.mp4', '-thumb.png')
            }
            alt={isBR ? media.description_pt : media.description}
            loading="lazy"
            itemProp="contentUrl"
          />
        ) : (
          <video
            src={FILE_DOMAIN + media.file}
            controls
            poster={
              (fullQuality ? FILE_DOMAIN : FILE_DOMAIN_500) +
              media.file.replace('.mp4', '-thumb.png')
            }
            autoPlay
            muted
            playsInline
            itemProp="contentUrl"
          />
        )}
      </>
    ) : (
      <img
        src={(fullQuality ? FILE_DOMAIN : FILE_DOMAIN_500) + media.file}
        srcSet={`${FILE_DOMAIN_500 + media.file} 500w, ${
          FILE_DOMAIN + media.file
        } ${media.width}w`}
        sizes={`(max-width: 500px) 500px, ${media.width}px`}
        alt={isBR ? media.description_pt : media.description}
        loading="lazy"
        itemProp="contentUrl"
      />
    );
  const link = host(
    '/countries/' +
      media.country +
      '/cities/' +
      media.city +
      (media.id.length <= 3 ? '/stories/' : '/posts/') +
      media.id +
      (isMain && !media.img_index && media.id.length > 3 ? '/1' : '') +
      (media.img_index ? '/' + media.img_index : '')
  );

  return (
    <div
      key={media.file}
      className={
        'instagram_media_gallery_item' +
        (isMain && media.type === 'instagram-story' && media.mode === 'portrait'
          ? ' ' + 'instagram_media_portrait'
          : '') +
        (media.gallery && media.gallery.length && !expandGalleries
          ? ' ' + 'instagram_media_is_gallery'
          : '')
      }
      itemScope
      itemType={
        media.file.includes('.mp4') && !isListing
          ? 'http://schema.org/VideoObject'
          : 'http://schema.org/ImageObject'
      }
    >
      {withoutLink ? (
        <div style={{ cursor: media.file.includes('.mp4') ? '' : 'zoom-in' }}>
          {mediaElement}
        </div>
      ) : (
        <Link href={link} style={{ display: 'block' }} prefetch={false}>
          {mediaElement}

          {(media.file_type === 'video' || media.file.includes('.mp4')) &&
            isListing && (
              <div className={'instagram_media_play_button'}>
                <img src="/images/play.svg" alt={i18n('Play Button')} />
              </div>
            )}
        </Link>
      )}

      <div className={'instagram_media_external_links'}>
        <a
          href={
            media.highlight
              ? 'https://www.instagram.com/stories/highlights/' +
                media.highlight.replace('media-highlight-', '') +
                '/'
              : media.link +
                (media.img_index ? '?img_index=' + media.img_index : '')
          }
          target="_blank"
        >
          <img
            src={host('/logos/instagram.png')}
            alt={isBR ? media.description_pt : media.description}
          />
        </a>
        <ShareButton
          text={isBR ? media.description_pt : media.description}
          url={link}
        />
      </div>

      <div>
        {isBR ? media.description_pt : media.description}{' '}
        {media.img_index ? '- Item ' + media.img_index : ''}
      </div>

      {!media.is_gallery &&
        media.locations &&
        media.location_data &&
        media.location_data[0] && (
          <div style={{ marginTop: 4 }} className={'instagram_media_location'}>
            {i18n(media.location_data.length > 1 ? 'Locations' : 'Location')}:{' '}
            <span itemProp="contentLocation">
              {media.location_data.map((location, i) => (
                <>
                  <Link
                    href={
                      '/countries/' +
                      media.country +
                      '/cities/' +
                      media.city +
                      '/locations/' +
                      location.slug
                    }
                    key={location.slug}
                    prefetch={false}
                  >
                    {isBR && location.name_pt
                      ? location.name_pt
                      : location.name}
                    {location.alternative_names &&
                      location.alternative_names.length &&
                      ' (' + location.alternative_names.join(', ') + ')'}
                  </Link>
                  {i < media.location_data.length - 1 ? ', ' : ''}
                </>
              ))}
            </span>
          </div>
        )}

      {!media.is_gallery && media.hashtags && media.hashtags.length > 0 && (
        <Hashtags
          hashtags={
            isBR && media.hashtags_pt ? media.hashtags_pt : media.hashtags
          }
        />
      )}

      <SchemaData
        media={media}
        isVideo={media.file.includes('.mp4') && !isListing}
        isExpand={expandGalleries && !isMain}
      />
    </div>
  );
}
