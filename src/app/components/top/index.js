import useHost from '@/app/hooks/use-host';
import { SITE_NAME } from '@/app/utils/constants';
import countries from '@/app/utils/countries';
import Link from 'next/link';

export default function Top() {
  const host = useHost();
  
  return <div className="profile">
    <Link href={ host('/') }>
      <img src={ host('profile-photo.jpg') } srcSet={ host('profile-photo-2x.jpg') + ' 2x' } width={96} height={96} alt="Profile photo" className="profile_picture" />
    </Link>

    <h2 className="profile_name">{SITE_NAME}</h2>

    <span className="profile_description">
      {countries.map(c => <Link href={'/countries/' + c.slug} key={c.name}>{c.flag}</Link>)}
    </span>
  </div>;
}
