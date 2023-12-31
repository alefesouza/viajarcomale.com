import { FILE_DOMAIN, FILE_DOMAIN_500 } from '@/app/utils/constants';
import Hashtags from '../hashtags';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import ShareButton from '../share-button';
import useI18n from '@/app/hooks/use-i18n';
import SchemaData from '../schema-data';
import expandDate from '@/app/utils/expand-date';
import YouTubeEmbed from './youtube-embed';
import TikTokEmbed from './tiktok-embed';
import getTypePath from '@/app/utils/get-type-path';

export default function Media({
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

  const [, country, , city] = media.path.split('/');

  media.id = media.id
    .replace(city + '-post-', '')
    .replace(city + '-story-', '')
    .replace(city + '-youtube-', '')
    .replace(city + '-short-video-', '');

  const isVideo =
    media.type === 'youtube' ||
    media.type === 'short-video' ||
    media.file.includes('.mp4');

  const mediaElement =
    media.type === 'post' || media.type === 'story' ? (
      isVideo ? (
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
          style={{ cursor: withoutLink ? 'zoom-in' : null }}
        />
      )
    ) : media.type === 'youtube' ||
      (media.type === 'short-video' && media.is_photos) ? (
      <YouTubeEmbed media={media} />
    ) : (
      <TikTokEmbed media={media} />
    );

  const link = host(
    '/countries/' +
      country +
      '/cities/' +
      city +
      '/' +
      getTypePath(media.type) +
      '/' +
      media.id +
      (isMain && !media.img_index && media.type === 'post' ? '/1' : '') +
      (media.img_index ? '/' + media.img_index : '')
  );

  return (
    <div
      key={media.file}
      className={
        'instagram_media_gallery_item' +
        (isMain && media.type === 'story' && media.mode === 'portrait'
          ? ' ' + 'instagram_media_portrait'
          : '') +
        (media.gallery && media.gallery.length > 0 && !expandGalleries
          ? ' ' + 'instagram_media_is_gallery'
          : '')
      }
      itemScope
      itemType={
        isVideo && !isListing
          ? 'http://schema.org/VideoObject'
          : 'http://schema.org/ImageObject'
      }
    >
      {withoutLink ? (
        <div>{mediaElement}</div>
      ) : (
        <Link href={link} style={{ display: 'block' }} prefetch={false}>
          {mediaElement}

          {isVideo && isListing && (
            <div className={'instagram_media_play_button'}>
              <img src="/images/play.svg" alt={i18n('Play Button')} />
            </div>
          )}
        </Link>
      )}

      <div className="instagram_media_external_links">
        {(media.type === 'post' || media.type === 'story') && (
          <a
            href={
              media.highlight
                ? 'https://www.instagram.com/stories/highlights/' +
                  media.original_id +
                  '/'
                : 'https://www.instagram.com/p/' +
                  media.original_id +
                  (media.img_index ? '?img_index=' + media.img_index : '')
            }
            target="_blank"
          >
            <img
              src={host('/logos/instagram.png')}
              alt={i18n('Instagram Icon')}
            />
          </a>
        )}

        {media.type === 'youtube' && (
          <a href={media.link} target="_blank">
            <img src={host('/logos/youtube.png')} alt={i18n('YouTube Icon')} />
          </a>
        )}

        {media.type === 'short-video' && (
          <>
            {['tiktok', 'instagram', 'youtube', 'kwai'].map(
              (item) =>
                media[item + '_link'] && (
                  <a href={media[item + '_link']} target="_blank" key={item}>
                    <img
                      src={host('/logos/' + item + '.png')}
                      alt={item + 'Video'}
                    />
                  </a>
                )
            )}
          </>
        )}
        <ShareButton
          text={isBR ? media.description_pt : media.description}
          url={link}
        />
      </div>

      {media.title && (
        <div style={{ fontWeight: 'bold' }}>
          {isBR && media.title_pt ? media.title_pt : media.title}{' '}
          {media.img_index ? '- Item ' + media.img_index : ''}
        </div>
      )}

      <div>
        {isBR && media.description_pt
          ? media.description_pt
          : media.description}{' '}
        {media.img_index ? '- Item ' + media.img_index : ''}
      </div>

      {media.type === 'story' && (
        <div style={{ marginTop: 4 }}>{expandDate(media.date, isBR)}</div>
      )}

      {!media.is_gallery &&
        media.locations &&
        media.location_data &&
        media.location_data[0] && (
          <div style={{ marginTop: 4 }} className={'instagram_media_location'}>
            {i18n(media.location_data.length > 1 ? 'Locations' : 'Location')}:{' '}
            <span>
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
                      location.alternative_names.length > 0 &&
                      ' (' + location.alternative_names.join(', ') + ')'}
                  </Link>
                  {i < media.location_data.length - 1 ? ', ' : ''}
                </>
              ))}
            </span>
          </div>
        )}

      {!media.is_gallery && media.hashtags && media.hashtags.length > 0 && (
        <Hashtags item={media} isBR={isBR} />
      )}

      <SchemaData
        media={media}
        isExpand={expandGalleries && !isMain}
        includeVideoTags={isVideo && !isListing}
      />
    </div>
  );
}
