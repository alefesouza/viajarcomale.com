import { parse } from 'js2xmlparser';
import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import { getFirestore } from 'firebase-admin/firestore';
import { FILE_DOMAIN, FILE_DOMAIN_500, SITE_NAME } from '@/app/utils/constants';
import removeDiacritics from '@/app/utils/remove-diacritics';
import getMetadata from '@/app/utils/get-metadata';
import getTypePath from '@/app/utils/get-type-path';
import logAccess from '@/app/utils/log-access';
import { redirect } from 'next/navigation';
import { customInitApp } from '@/app/firebase';

customInitApp();

export async function GET(req) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  let { pathname } = new URL(req.url);

  let hashtag = null;

  const split = pathname.split('/');

  if (pathname.includes('/hashtags/')) {
    hashtag = removeDiacritics(decodeURIComponent(split[3]));
  }

  const db = getFirestore();
  const hashtagPtSnapshot = await db
    .collection('hashtags')
    .where('name_pt', '==', hashtag)
    .get();
  let hashtagPt = null;
  let hashtagEn = null;

  hashtagPtSnapshot.forEach((doc) => {
    hashtagPt = doc.data();
  });

  if (!hashtagPt) {
    const hashtagEnDoc = await db.collection('hashtags').doc(hashtag).get();
    hashtagEn = hashtagEnDoc.data();
  }

  const finalHashtag = hashtagPt || hashtagEn;

  if (!finalHashtag) {
    redirect('/hashtags');
  }

  const cacheRef = `/caches/hashtags/hashtags-cache/${finalHashtag.name}/sort/desc`;

  let cache = await db.doc(cacheRef).get();

  if (!cache.exists) {
    await fetch(host(pathname.replace('/rss', '')), {
      headers: {
        'User-Agent': req.headers.get('user-agent'),
      },
    });

    cache = await db.doc(cacheRef).get();

    if (!cache.exists) {
      redirect(pathname.replace('/rss', ''));
    }
  }

  const photos = cache.data().photos;

  let instagramPhotos = photos.filter(
    (p) => p.type === 'post' || p.type === 'post-gallery'
  );
  const instagramStories = photos.filter((p) => p.type === 'story');
  const shortVideos = photos.filter((p) => p.type === 'short-video');
  const youtubeVideos = photos
    .filter((p) => p.type === 'youtube')
    .map((c) => ({
      ...c,
      file: c.image,
    }));
  const _360photos = photos.filter((p) => p.type === '360photo');

  instagramStories.sort(function (a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  let expandedList = [];

  instagramPhotos.forEach((item) => {
    expandedList = [...expandedList, item];

    if (item.gallery && item.gallery.length) {
      const gallery = item.gallery.map((g, i) => ({
        ...item,
        ...g,
        is_gallery: true,
        img_index: i + 2,
      }));
      const itemWithHashtag = gallery.findIndex(
        (g) => g.item_hashtags && g.item_hashtags.includes(hashtag)
      );

      if (itemWithHashtag > -1) {
        delete gallery[itemWithHashtag].is_gallery;
        expandedList[expandedList.length - 1] = gallery[itemWithHashtag];

        item.file_type = 'image';
        gallery[itemWithHashtag] = item;
      }

      if (item.rss && item.rss.includes(finalHashtag.name)) {
        expandedList = [...expandedList, ...gallery];
      } else {
        expandedList = [
          ...expandedList,
          ...gallery.filter(
            (g) => g.rss_include && g.rss_include.includes(finalHashtag.name)
          ),
        ];
      }
    }
  });

  instagramPhotos = expandedList;

  const title = '#' + hashtag + ' - Hashtags - ' + SITE_NAME;
  const description = i18n(
    'Photos and videos taken by Viajar com Alê with the hashtag #:hashtag:.',
    {
      hashtag,
    }
  );

  let obj = {
    '@': {
      version: '2.0',
      'xmlns:atom': 'http://www.w3.org/2005/Atom',
      'xmlns:media': 'http://search.yahoo.com/mrss/',
      'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
    },
    channel: {
      title,
      link: host(pathname.replace('/rss', '')),
      description,
      copyright: SITE_NAME + ' - @viajarcomale',
      language: isBR ? 'pt-BR' : 'en-US',
      category: 'Travel',
      editor: 'contato@viajarcomale.com (Viajar com Alê)',
      webMaster: 'contact@alefesouza.com (Alefe Souza)',
      ['atom:link']: {
        '@': {
          href: host(pathname),
          rel: 'self',
          type: 'application/rss+xml',
        },
      },
      image: {
        title,
        description,
        url: host('/icons/144x144.png'),
        link: host(pathname.replace('/rss', '')),
        width: 144,
        height: 144,
      },
      item: [
        ...instagramStories,
        ...instagramPhotos,
        ...shortVideos,
        ...youtubeVideos,
        ..._360photos,
      ]
        .filter((c) => !c.rss_ignore)
        .map((p) => {
          let { title, description } = getMetadata(p, isBR);
          description += p.hashtags
            ? ' - Hashtags: #' +
              (isBR && p.hashtags_pt ? p.hashtags_pt : p.hashtags).join(' #')
            : '';

          const [, country, , city] = p.path.split('/');

          const mediaId = p.id
            .replace(city + '-story-', '')
            .replace(city + '-post-', '')
            .replace(city + '-youtube-', '')
            .replace(city + '-short-video-', '')
            .replace(city + '-360video-', '');

          const link = host(
            `/countries/${country}/cities/${city}/${getTypePath(
              p.type
            )}/${mediaId}${p.img_index ? '/' + p.img_index : ''}`
          );

          const media = {
            '@': {
              url: FILE_DOMAIN + p.file,
              medium: p.file.includes('.mp4') ? 'video' : 'image',
              width: p.width,
              height: p.height,
              type: p.file.includes('.mp4') ? 'video/mp4' : 'image/jpeg',
            },
            ['media:credit']: {
              '@': {
                role: 'photographer',
                scheme: 'urn:ebu',
              },
              '#': 'Alefe Souza',
            },
            ['media:copyright']:
              'https://creativecommons.org/licenses/by-nc/4.0/',
          };

          if (p.file.includes('.mp4')) {
            media['media:thumbnail'] = {
              '@': {
                url: FILE_DOMAIN + p.file.replace('.mp4', '-thumb.png'),
                width: p.width,
                height: p.height,
              },
            };
          }

          return {
            title,
            description,
            link,
            guid: {
              '@': {
                isPermaLink: true,
              },
              '#': link,
            },
            pubDate: new Date(p.date).toUTCString(),
            category: 'Travel',
            ['media:category']: p.hashtags
              ? isBR && p.hashtags_pt
                ? p.hashtags_pt
                : p.hashtags
              : [],
            ['media:content']: media,
            ['dc:creator']: 'Alefe Souza',
          };
        }),
    },
  };

  logAccess(db, host('/rss/hashtags/') + hashtag);

  obj = parse('rss', obj, { declaration: { encoding: 'UTF-8' } });

  return new Response(obj, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
