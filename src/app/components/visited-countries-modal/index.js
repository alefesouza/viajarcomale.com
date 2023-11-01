'use client'

import getURL from '@/app/utils/get-url';
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
          <div style={{ flex: 1, paddingTop: 6 }}>
            <Image src={ getURL('icons/144x144.png') } width={72} height={72} alt="Viajar com Alê Icon" />
            <Image src={ getURL('images/asexplore.png') } width={72} height={72} alt="ASExplore Icon" />
          </div>
          <div className={styles.close} onClick={handleClose}>X</div>
      </div>

      <div className={ styles.visited_countries }>
        <VisitedCountries isModal={ true } />
      </div>
    </div>
  </div>
}
