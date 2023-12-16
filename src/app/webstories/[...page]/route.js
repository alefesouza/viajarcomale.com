import useHost from '@/app/hooks/use-host';
import { redirect } from 'next/navigation';

// Remove Next.js assets from Web Stories pages.
export async function GET(req) {
  const host = useHost();
  const { pathname } = new URL(req.url);

  const request = await fetch(host(pathname.replace('/webstories', '') + '/webstories'));
  const data = await request.text();

  let $ = require('cheerio').load(data);

  if ($('amp-story-page').length <= 1) {
    redirect(pathname.replace('/webstories', ''));
  }

  $('link[href^="/_next"]').remove();
  $('script:not(.amp-asset)').remove();
  $('next-route-announcer').remove();
  $('nextjs-portal').remove();
  $('html').attr('amp', '');
  $('[standalone]').attr('standalone', '');
  $('[autoplay]').attr('autoplay', '');
  $('[itemscope]').attr('itemscope', '');
  $('.cover-link').attr('href', host(pathname.replace('/webstories', '')));
  $('head').append(`<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>`)
  $('head').append(`<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>`)

  return new Response($.html(), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
