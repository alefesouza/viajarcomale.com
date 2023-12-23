import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import { headers } from 'next/headers';
import { FILE_DOMAIN, FILE_DOMAIN_SQUARE, SITE_NAME } from './constants';
import getMetadata from './get-metadata';

export default function defaultMetadata(title, description, media, isSingle) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  const headersList = headers();
  const isWebStories = headersList.get('x-pathname').includes('/webstories');
  let pathname =
    (isWebStories ? '/webstories' : '') +
    headersList.get('x-pathname').replace('/webstories', '');

  const defaultTitle = SITE_NAME;
  const defaultDescription = i18n(
    'Travel photos and links to Viajar com Alê social networks.'
  );

  const canonical = new URL(
    pathname,
    isBR ? 'https://viajarcomale.com.br' : 'https://viajarcomale.com'
  ).toString();

  let images = [];

  if (media) {
    const metadata = getMetadata(media, isBR);

    images = [
      {
        url:
          (media.type === 'instagram-story' ||
          media.type === 'instagram-highlight'
            ? FILE_DOMAIN_SQUARE
            : FILE_DOMAIN) + media.file.replace('.mp4', '-thumb.png'),
        width: media.width,
        height:
          media.type === 'instagram-story' ||
          media.type === 'instagram-highlight'
            ? media.width
            : media.height,
        type: media.file.includes('.png') ? 'image/png' : 'image/jpeg',
        alt: metadata.description,
      },
    ];
  } else {
    images = [
      {
        url: host('media.jpg'),
        width: 1280,
        height: 630,
        type: 'image/jpg',
        alt: description || defaultDescription,
      },
    ];
  }

  return {
    title: title || defaultTitle,
    description: description || defaultDescription,
    openGraph: {
      title: title || defaultTitle,
      description: description || defaultDescription,
      images,
      url: canonical,
      videos:
        isSingle && media && media.file.includes('.mp4')
          ? [
              {
                url: FILE_DOMAIN + media.file,
                width: media.width,
                height: media.height,
                type: 'video/mp4',
              },
            ]
          : null,
      type:
        isSingle && media && media.file.includes('.mp4')
          ? 'video.movie'
          : 'website',
      ...(isSingle && media && media.file.includes('.mp4')
        ? {
            duration: Math.ceil(media.duration),
            releaseDate: media.date.replace(' ', 'T') + '+03:00',
            directors: ['Alefe Souza - ' + SITE_NAME],
            tags:
              isBR && media.hashtags_pt
                ? media.hashtags_pt
                : media.hashtags || [],
          }
        : null),
    },
    twitter: {
      title: title || defaultTitle,
      description: description || defaultDescription,
      images,
    },
    other: {
      title: title || defaultTitle,
      image: images[0].url,
    },
    alternates: {
      canonical,
      languages: {
        'x-default': 'https://viajarcomale.com' + pathname,
        en: 'https://viajarcomale.com' + pathname,
        pt: 'https://viajarcomale.com.br' + pathname,
      },
    },
  };
}
