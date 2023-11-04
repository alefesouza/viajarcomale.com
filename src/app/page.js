import links from './utils/links';
import HomeButton from './components/home-button';
import VisitedCountries from './components/visited-countries';
import styles from './page.module.css';
import useI18n from './hooks/use-i18n';
import useHost from './hooks/use-host';

export default async function Home() {
    const host = useHost();
    const i18n = useI18n();

    return <>
        <div className="list-group">
            {links.map(l => <HomeButton key={l.text} text={l.translate ? i18n(l.text) : l.text} url={l.url} image={l.image ? host(l.image) : null} />)}
            <a href="#" id="add-to-home"
                className="list-group-item list-group-item-action" style={{ display: 'none' }}>{i18n('Add to Home Screen')}</a>
        </div>

        <div className={styles.bottom_links}>
            <a href="https://instagram.com/viajarcomale" target="_blank">
                <img src={ host('logos/instagram.png') } width={32} height={32} alt="Instagram Icon" />
            </a>
            <a href="https://tiktok.com/@viajarcomale" target="_blank">
                <img src={ host('logos/tiktok.png') } width={32} height={32} alt="TikTok Icon" />
            </a>
            <a href="https://youtube.com/c/alefesouza" target="_blank">
                <img src={ host('logos/youtube.png') } width={32} height={22} alt="YouTube Icon" />
            </a>
            <a href="mailto:contato@viajarcomale.com" className={styles.email_icon}>@</a>
        </div>

        <div className={styles.stickers}>
            <img src={ host('icons/144x144.png') } srcSet={ host('icons/any.svg') } width={144} height={144} alt="Viajar com Alê Icon" />
            <img src={ host('images/asexplore-144.png') } srcSet={ host('images/asexplore-288.png') + ' 2x' } width={144} height={144} alt="ASExplore Icon" />
        </div>

        <VisitedCountries />
    </>
}
