import useHost from '@/app/hooks/use-host';
import Link from '@/app/link/page';
import countries from '@/app/utils/countries';

export default function Top() {
  const host = useHost();
  
  return <div className="profile">
    <Link href={host('/')}>
      <img src={ host('profile-photo.jpg') } srcSet={ host('profile-photo-2x.jpg') + ' 2x' } width={96} height={96} alt="Profile photo" className="profile_picture" />
    </Link>

    <span className="profile_name">Viajar com Alê</span>

    <span className="profile_description">
      {countries.map(c => c.flag)}
    </span>
  </div>;
}
