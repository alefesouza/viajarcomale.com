import { permanentRedirect } from 'next/navigation';

export async function GET(req) {
  const { pathname } = new URL(req.url);
  let [, , country, , city, , media, index] = pathname.split('/');

  if (media.startsWith('story-')) {
    const split = media.split('-');
    media = split[split.length - 1];
  } else {
    media = media.replace('media-', '');
  }

  permanentRedirect(
    '/countries/' +
      country +
      '/cities/' +
      city +
      (media.length <= 3 ? '/stories/' : '/posts/') +
      media +
      (index ? '/' + index : '')
  );
}
