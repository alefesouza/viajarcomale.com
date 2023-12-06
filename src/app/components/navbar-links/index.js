import Link from 'next/link';
import { headers } from 'next/headers';
import useI18n from '@/app/hooks/use-i18n';

const NavbarLinks = () => {
  const headersList = headers();
  const i18n = useI18n();

  return <ul className="navbar-nav">
    <li className={'nav-item' + (headersList.get('x-pathname') === '/' ? ' active' : '')}>
      <Link className="nav-link" href="/">{i18n('Home')}</Link>
    </li>
    <li className={'nav-item' + (headersList.get('x-pathname') === '/countries' ? ' active' : '')}>
      <Link className="nav-link" href="/countries">{i18n('Albums')}</Link>
    </li>
  </ul>
}

export default NavbarLinks;
