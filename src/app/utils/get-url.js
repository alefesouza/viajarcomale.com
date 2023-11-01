const IS_SERVER = typeof window === 'undefined';

export default function getURL(headersList, path) {
  const firebaseURL = headersList.get('x-forwarded-host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https://' : 'http://';

  const baseURL = IS_SERVER
    ? process.env.NEXT_PUBLIC_SITE_URL
    : window.location.origin;
    console.log()
    
  return new URL(path, firebaseURL ? protocol + firebaseURL : baseURL).toString();
}
