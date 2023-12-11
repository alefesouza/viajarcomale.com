import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import { SITE_NAME } from '@/app/utils/constants';
import countries from '@/app/utils/countries';
import Link from 'next/link';

export default function Top() {
  const host = useHost();
  const i18n = useI18n();
  
  return <div className="profile">
    <Link href={ host('/') }>
      <img src={ host('profile-photo.jpg') } srcSet={ host('profile-photo-2x.jpg') + ' 2x' } width={96} height={96} alt={i18n('Profile Photo')} className="profile_picture" />
    </Link>

    <Link href={ host('/') }><h2 className="profile_name">{SITE_NAME}</h2></Link>

    <span className="profile_description">
      {countries.map(c => <Link href={'/countries/' + c.slug} key={c.name} prefetch={false}>{c.flag}</Link>)}
    </span>
  </div>;
}
