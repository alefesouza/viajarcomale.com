'use client'

import countries from '@/app/utils/countries';
import { useState } from 'react';
import Chart from 'react-google-charts';
import VisitedCountriesModal from '../visited-countries-modal';

export default function VisitedCountries({ isModal }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return <div>
    {isModalOpen && <VisitedCountriesModal onClose={() => setIsModalOpen(false)} />}
    <div onClick={() => !isModal && setIsModalOpen(true)} style={{ cursor: 'pointer', marginBottom: isModal ? 20 : 100 }}>
      <Chart
        chartType="GeoChart"
        data={[['Country'], ...countries.map(c => [c.name])]}
        width="100%"
        options={{
          backgroundColor: 'transparent',
          defaultColor: '#2096cc',
        }}
      />
    </div>
  </div>
}
