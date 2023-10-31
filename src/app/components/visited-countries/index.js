'use client'

import countries from '@/app/utils/countries';
import { useState } from 'react';
import Chart from 'react-google-charts';
import VisitedCountriesModal from '../visited-countries-modal';

export default function VisitedCountries() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return <div>
    {isModalOpen && <VisitedCountriesModal onClose={() => setIsModalOpen(false)} />}
    <div onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer' }}>
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
