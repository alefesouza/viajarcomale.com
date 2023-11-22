import useHost from '../hooks/use-host';
import { customInitApp } from '../firebase';

customInitApp();

export async function GET() {
  const host = useHost();

  return new Response(
    `User-agent: *
Disallow: /*?*sort=
Disallow: /*?*shuffle=
Disallow: /*?*indexes=

Sitemap: ${host('/sitemap.xml')}`
  , {
    headers: { 'Content-Type': 'text/plain' },
  });
}
