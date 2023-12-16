import { headers } from 'next/headers';

export default function useHost() {
  const headersList = headers();
  
  const firebaseURL = headersList.get('x-forwarded-host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https://' : 'http://';

  const baseURL = process.env.NEXT_PUBLIC_SITE_URL;

  return (path) => {
    return new URL(path, firebaseURL ? protocol + firebaseURL : baseURL).toString();
  };
}
