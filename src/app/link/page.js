import { redirect } from 'next/navigation';

export default function Link({ searchParams }) {
  const { url } = searchParams;

  if ( url && ( url.includes('web+viajarcomale://') || url.includes('web+vca://') ) ) {
    redirect(url
        .replace('web+viajarcomale:/', '')
        .replace('web+vca:/', ''));
  }

  redirect('/');
}
