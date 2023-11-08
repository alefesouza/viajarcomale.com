import links from './utils/links';
import HomeButton from './components/home-button';
import useI18n from './hooks/use-i18n';
import useHost from './hooks/use-host';
import Link from 'next/link';
import Top from './components/top';
import Footer from './components/footer';

export default async function Home() {
    const host = useHost();
    const i18n = useI18n();

    return <div className="container">
        <div className="list-group">
            <Link href="/countries" className="list-group-item list-group-item-action">{i18n('Albums')}</Link>
            {links.map(l => <HomeButton key={l.text} text={l.translate ? i18n(l.text) : l.text} url={l.url} image={l.image ? host(l.image) : null} />)}
            <a href="#" id="add-to-home"
                className="list-group-item list-group-item-action" style={{ display: 'none' }}>{i18n('Add to Home Screen')}</a>
        </div>
    </div>
}
