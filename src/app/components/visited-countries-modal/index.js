'use client'

import getURL from '@/app/utils/get-url';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import VisitedCountries from '../visited-countries';
import styles from './index.module.css';

export default function VisitedCountriesModal() {
  const router = useRouter();

  return <div id="visited-countries-modal" className={styles.modal}>
      <div className={styles.dialog}>
          <div className={styles.header}>
              <div style={{ flex: 1 }}>
                  <Image src={ getURL('icons/144x144.png') } width={144} height={144} alt="Viajar com Alê Icon" />
                  <Image src={ getURL('images/asexplore.png') } width={144} height={144} alt="ASExplore Icon" />
              </div>
              <div className={styles.close} onClick={router.back}>X</div>
          </div>

          <VisitedCountries />
      </div>
  </div>
}
