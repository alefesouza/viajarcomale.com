import { headers } from 'next/headers';

const IS_SERVER = typeof window === 'undefined';

export default function useHost() {
  const headersList = headers();
  
  const firebaseURL = IS_SERVER ? headersList.get('x-forwarded-host') : window.location.host;
  const protocol = process.env.NODE_ENV === 'production' ? 'https://' : 'http://';

  const baseURL = IS_SERVER
    ? process.env.NEXT_PUBLIC_SITE_URL
    : window.location.origin;

  return (path) => {
    return new URL(path, firebaseURL ? protocol + firebaseURL : baseURL).toString();
  };
}
