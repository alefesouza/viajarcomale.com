import Image from 'next/image';
import links from './utils/links';
import countries from './utils/countries';
import HomeButton from './components/home-button';
import getURL from './utils/get-url';
import VisitedCountries from './components/visited-countries';
import styles from './page.module.css';
import { headers } from 'next/headers'
import { getI18n } from './utils/get-i18n';

export default async function Home() {
    const headersList = headers();

    return <main className="container">
        <div className={styles.profile}>
            <Image src={ getURL(headersList, 'profile-photo.jpg') } width={96} height={96} alt="Profile photo" className={styles.profile_picture} />

            <span className={styles.profile_name}>Viajar com Alê</span>

            <span className={styles.profile_description}>
              {countries.map(c => c.flag)}
            </span>
        </div>

        <div className="list-group">
            {links.map(l => <HomeButton key={l.text} text={l.translate ? getI18n(headersList, l.text) : l.text} url={l.url} image={l.image ? getURL(headersList, l.image) : null} />)}
            <a href="#" id="add-to-home"
                className="list-group-item list-group-item-action" style={{ display: 'none' }}>{getI18n(headersList, 'Add to Home Screen')}</a>
        </div>

        <div className={styles.bottom_links}>
            <a href="https://instagram.com/viajarcomale" target="_blank">
                <Image src={ getURL(headersList, 'logos/instagram.png') } width={32} height={32} alt="Instagram Icon" />
            </a>
            <a href="https://tiktok.com/@viajarcomale" target="_blank">
                <Image src={ getURL(headersList, 'logos/tiktok.png') } width={32} height={32} alt="TikTok Icon" />
            </a>
            <a href="https://youtube.com/c/alefesouza" target="_blank">
                <Image src={ getURL(headersList, 'logos/youtube.png') } width={32} height={22} alt="YouTube Icon" />
            </a>
            <a href="mailto:contato@viajarcomale.com" target="_blank" className={styles.email_icon}>@</a>
        </div>

        <div className={styles.stickers}>
            <Image src={ getURL(headersList, 'icons/144x144.png') } width={144} height={144} alt="Viajar com Alê Icon" />
            <Image src={ getURL(headersList, 'images/asexplore.png') } width={144} height={144} alt="ASExplore Icon" />
        </div>

        <VisitedCountries />
    </main>
}
