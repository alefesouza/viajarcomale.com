'use client'

import countries from '@/app/utils/countries';
import Chart from 'react-google-charts';

export default function VisitedCountries() {
  return <Chart
    chartType="GeoChart"
    data={[['Country'], ...countries.map(c => [c.name])]}
    width="100%"
    options={{
      backgroundColor: 'transparent',
      defaultColor: '#2096cc',
    }}
  />
}
