import useHost from '@/app/hooks/use-host';

// Remove Next.js assets from Web Stories pages.
export async function GET(req) {
  const host = useHost();
  const { pathname } = new URL(req.url);

  const request = await fetch(host(pathname.replace('/webstories', '') + '/webstories'));
  const data = await request.text();

  let $ = require('cheerio').load(data);

  $('link[href^="/_next"]').remove();
  $('script:not(.amp-asset)').remove();
  $('style:not(.amp-asset)').remove();
  $('next-route-announcer').remove();
  $('nextjs-portal').remove();

  return new Response($.html(), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
