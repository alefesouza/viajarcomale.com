'use client'

import Image from 'next/image';
import VisitedCountries from '../visited-countries';
import styles from './index.module.css';

export default function VisitedCountriesModal({ onClose: handleClose }) {
  const onBackdropClick = (e) => {
    if (e.target.id !== 'visited-countries-modal') {
      return;
    }

    handleClose();
  }

  return <div id="visited-countries-modal" className={styles.modal} onClick={onBackdropClick}>
    <div className={styles.dialog}>
      <div className={styles.header}>
          <div className={ styles.header_stickers }>
            <Image src={ new URL('icons/144x144.png', window.location.origin).toString() } width={72} height={72} alt="Viajar com Alê Icon" />
            <Image src={ new URL('images/asexplore.png', window.location.origin).toString() } width={72} height={72} alt="ASExplore Icon" />
          </div>
          <div className={styles.close} onClick={handleClose}>X</div>
      </div>

      <div className={ styles.visited_countries }>
        <VisitedCountries isModal={ true } />
      </div>
    </div>
  </div>
}
