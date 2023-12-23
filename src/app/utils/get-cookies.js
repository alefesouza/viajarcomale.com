import { cookies } from 'next/headers';

export default function getCookie(name) {
  const cookieStore = cookies();

  if (!cookieStore.get('__session')) {
    return null;
  }

  const searchParams = new URLSearchParams(cookieStore.get('__session').value);

  return searchParams.get(name);
}
