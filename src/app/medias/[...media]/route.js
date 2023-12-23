import { permanentRedirect } from 'next/navigation';
import { FILE_DOMAIN } from '@/app/utils/constants';

// For some reason Google is trying to index these pages.
export async function GET(req) {
  const { pathname } = new URL(req.url);

  permanentRedirect(FILE_DOMAIN + pathname);
}
