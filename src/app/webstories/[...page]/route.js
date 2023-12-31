import useHost from '@/app/hooks/use-host';
import { redirect, permanentRedirect } from 'next/navigation';
import getCookie from '@/app/utils/get-cookies';
import { getStorage } from 'firebase-admin/storage';

// Remove Next.js assets from Web Stories pages.
export async function GET(req) {
  const host = useHost();
  let { pathname, searchParams } = new URL(req.url);
  const sort = searchParams.get('sort');

  if (pathname.includes('/highlights/')) {
    const [, , , country, , city] = pathname.split('/');
    pathname =
      '/webstories/countries/' + country + '/cities/' + city + '/stories';

    permanentRedirect(pathname);
  }

  const ignoreAnalytics =
    getCookie('ignore_analytics') || host().includes('localhost');

  const reference =
    'webstories/' +
    host(pathname + '-' + (sort === 'asc' ? 'asc' : 'desc') + '.html')
      .split('//')[1]
      .replaceAll('/', '-')
      .replace('www.', '')
      .replace('viajarcomale', '');

  const storage = getStorage();
  let cacheExists = [false];

  if (sort !== 'random') {
    cacheExists = await storage
      .bucket('viajarcomale.appspot.com')
      .file(reference)
      .exists();
  }

  let html = '';

  if (!cacheExists[0] || sort === 'random') {
    const request = await fetch(
      host(pathname.replace('/webstories', '') + '/webstories') +
        '?fixer=true' +
        (sort !== 'desc' ? '&sort=' + sort : ''),
      {
        headers: {
          'User-Agent': req.headers.get('user-agent'),
        },
      }
    );

    if (request.redirected) {
      redirect(request.url);
    }

    const data = await request.text();

    let $ = require('cheerio').load(data);

    if ($('amp-story-page').length <= 1) {
      redirect(pathname.replace('/webstories', ''));
    }

    $('link[href^="/_next"]').remove();
    $('script:not(.amp-asset)').remove();
    $('script.amp-asset').attr('class', '');
    $('next-route-announcer').remove();
    $('nextjs-portal').remove();
    $('html').attr('amp', '');
    $('[standalone]').attr('standalone', '');
    $('[autoplay]').attr('autoplay', '');
    $('[itemscope]').attr('itemscope', '');
    $('.cover-link').attr('href', host(pathname.replace('/webstories', '')));
    $('head').append(
      `<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>`
    );
    $('head').append(
      `<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>`
    );

    html = $.html();

    if (sort !== 'random') {
      storage.bucket('viajarcomale.appspot.com').file(reference).save(html);
    }
  } else {
    const contents = await storage
      .bucket('viajarcomale.appspot.com')
      .file(reference)
      .download();
    html = contents;
  }

  if (ignoreAnalytics) {
    let $ = require('cheerio').load(html.toString());
    $('amp-story-auto-analytics').remove();
    $('[custom-element="amp-story-auto-analytics"]').remove();
    html = $.html();
  }

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
