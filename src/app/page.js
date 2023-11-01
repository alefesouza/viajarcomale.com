import Image from 'next/image';
import links from './utils/links';
import countries from './utils/countries';
import HomeButton from './components/home-button';
import VisitedCountries from './components/visited-countries';
import styles from './page.module.css';
import useI18n from './hooks/use-i18n';
import useHost from './hooks/use-host';

export default async function Home() {
    const host = useHost();
    const i18n = useI18n();

    return <main className="container">
        <div className={styles.profile}>
            <Image src={ host('profile-photo.jpg') } width={96} height={96} alt="Profile photo" className={styles.profile_picture} />

            <span className={styles.profile_name}>Viajar com Alê</span>

            <span className={styles.profile_description}>
              {countries.map(c => c.flag)}{i18n('en')}
            </span>
        </div>

        <div className="list-group">
            {links.map(l => <HomeButton key={l.text} text={l.translate ? i18n(l.text) : l.text} url={l.url} image={l.image ? host(l.image) : null} />)}
            <a href="#" id="add-to-home"
                className="list-group-item list-group-item-action" style={{ display: 'none' }}>{i18n('Add to Home Screen')}</a>
        </div>

        <div className={styles.bottom_links}>
            <a href="https://instagram.com/viajarcomale" target="_blank">
                <Image src={ host('logos/instagram.png') } width={32} height={32} alt="Instagram Icon" />
            </a>
            <a href="https://tiktok.com/@viajarcomale" target="_blank">
                <Image src={ host('logos/tiktok.png') } width={32} height={32} alt="TikTok Icon" />
            </a>
            <a href="https://youtube.com/c/alefesouza" target="_blank">
                <Image src={ host('logos/youtube.png') } width={32} height={22} alt="YouTube Icon" />
            </a>
            <a href="mailto:contato@viajarcomale.com" target="_blank" className={styles.email_icon}>@</a>
        </div>

        <div className={styles.stickers}>
            <Image src={ host('icons/144x144.png') } width={144} height={144} alt="Viajar com Alê Icon" />
            <Image src={ host('images/asexplore.png') } width={144} height={144} alt="ASExplore Icon" />
        </div>

        <VisitedCountries />
    </main>
}
