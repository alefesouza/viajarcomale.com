import useI18n from '@/app/hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import {
  FILE_DOMAIN,
  FILE_DOMAIN_LANDSCAPE,
  FILE_DOMAIN_PORTRAIT,
  FILE_DOMAIN_SQUARE,
  SITE_NAME,
} from '@/app/utils/constants';
import SchemaData from '../schema-data';
import getMetadata from '@/app/utils/get-metadata';
import { headers } from 'next/headers';
import { UAParser } from 'ua-parser-js';
import expandDate from '@/app/utils/expand-date';

export default async function WebStories({
  title,
  storyTitle,
  items,
  countryData,
  hashtag,
}) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  const headersList = headers();
  const isWindows =
    new UAParser(headersList.get('user-agent')).getOS().name === 'Windows';

  let highlightItem = items.find((i) => i.is_highlight);

  if (hashtag) {
    const highlight = items.find(
      (i) => i.highlight_hashtags && i.highlight_hashtags.includes(hashtag)
    );

    if (highlight) {
      highlightItem = highlight;
    }
  }

  let firstItem = highlightItem ? highlightItem : items[0] || {};

  const theCover = firstItem?.file?.replace('.mp4', '-thumb.png');

  const textStyles = {
    background: '#ffffff',
    width: 'auto',
    padding: '2px 10px',
    borderRadius: '5px',
    fontWeight: 'bold',
    fontFamily:
      'system-ui,-apple-system,Segoe UI,Roboto,Helvetica Neue,Noto Sans,Liberation Sans,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
    WebkitBoxDecorationBreak: 'clone',
    boxDecorationBreak: 'clone',
    display: 'inline',
    paddingBottom: 5,
  };

  const needSplit = storyTitle.split(' ').length == 1;

  const { description } = getMetadata(firstItem, isBR);

  return (
    <amp-story
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
          <amp-img
            src={FILE_DOMAIN + theCover}
            width={firstItem.width}
            height={firstItem.height}
            layout="responsive"
            alt={description}
            style={{ filter: 'brightness(70%)' }}
          ></amp-img>
          <SchemaData media={firstItem} isWebStories={true} />
        </amp-story-grid-layer>
        <amp-story-grid-layer template="vertical">
          <amp-img
            src={host('/icons/96x96.png')}
            srcSet={host('/icons/192x192.png') + ' 2x'}
            width={96}
            height={96}
          ></amp-img>
          <div style={{ width: '100%', marginLeft: 6, marginRight: 6 }}>
            <h1
              style={{
                ...textStyles,
                fontSize:
                  storyTitle.length >= 35 && needSplit
                    ? 17
                    : storyTitle.length >= 30 && needSplit
                    ? 22
                    : storyTitle.length >= 25 && needSplit
                    ? 28
                    : 32,
              }}
            >
              {storyTitle}
            </h1>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: 10,
                fontSize: 55,
              }}
            >
              {countryData ? (
                isWindows ? (
                  <amp-img
                    src={host('/flags/' + countryData.slug + '.png')}
                    alt={i18n(countryData.name)}
                    width={55}
                    height={55}
                  />
                ) : (
                  ' ' + countryData.flag
                )
              ) : null}
            </div>
          </div>
        </amp-story-grid-layer>
        <amp-story-page-outlink layout="nodisplay">
          <a href="" className="cover-link">
            {i18n('Open')}
          </a>
        </amp-story-page-outlink>
      </amp-story-page>
      {items.map((item) => {
        const { description } = getMetadata(item, isBR);
        const [, country, , city] = item.path.split('/');

        item.id = item.id
          .replace(city + '-post-', '')
          .replace(city + '-story-', '');

        return (
          <amp-story-page
            key={item.id}
            id={item.id}
            auto-advance-after={
              item.file.includes('.mp4') ? item.id + '-video' : '5s'
            }
            itemScope
            itemType={
              item.file.includes('.mp4')
                ? 'http://schema.org/VideoObject'
                : 'http://schema.org/ImageObject'
            }
          >
            <amp-story-grid-layer template="fill">
              {item.file.includes('.mp4') ? (
                <amp-video
                  width={item.width}
                  height={item.height}
                  layout="responsive"
                  poster={FILE_DOMAIN + item.file.replace('.mp4', '-thumb.png')}
                  id={item.id + '-video'}
                  autoplay
                  cache="google"
                >
                  <source src={FILE_DOMAIN + item.file} type="video/mp4" />
                </amp-video>
              ) : (
                <>
                  <amp-img
                    src={FILE_DOMAIN + item.file.replace('.mp4', '-thumb.png')}
                    width={item.width}
                    height={item.height}
                    layout="responsive"
                    alt={description}
                  ></amp-img>
                </>
              )}

              <SchemaData media={item} isWebStories={true} />
            </amp-story-grid-layer>
            <amp-story-grid-layer template="vertical">
              <div
                style={{
                  ...textStyles,
                  color: '#fff',
                  background: 'none',
                  position: 'absolute',
                  top: 18,
                  left: 5,
                  display: 'flex',
                  alignContent: 'center',
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                @viajarcomale{' '}
                <div
                  style={{
                    fontWeight: 'normal',
                    fontSize: 14,
                    marginTop: 6,
                    marginLeft: 8,
                  }}
                >
                  {expandDate(item.date, isBR, true)}
                </div>
              </div>
            </amp-story-grid-layer>
            <amp-story-page-outlink layout="nodisplay">
              <a
                href={host(
                  '/countries/' +
                    country +
                    '/cities/' +
                    city +
                    '/stories/' +
                    item.id
                )}
                target="_blank"
              >
                {i18n('Open')}
              </a>
            </amp-story-page-outlink>
          </amp-story-page>
        );
      })}
      <amp-story-auto-analytics
        gtag-id={
          isBR ? process.env.NEXT_GA_TRACKING_BR : process.env.NEXT_GA_TRACKING
        }
      ></amp-story-auto-analytics>
    </amp-story>
  );
}
