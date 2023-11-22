import {parse} from 'js2xmlparser';
import useHost from '../hooks/use-host';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { ITEMS_PER_PAGE } from '../utils/constants';
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
