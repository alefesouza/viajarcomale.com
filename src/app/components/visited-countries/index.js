'use client';

import countries from '@/app/utils/countries';
import Chart from 'react-google-charts';
import useI18nClient from '@/app/hooks/use-i18n-client';
import { useRouter } from 'next/navigation';

export default function VisitedCountries() {
  const router = useRouter()
  const i18n = useI18nClient();

  return (
    <div
      style={{ cursor: 'pointer', marginBottom: 20, width: '100%', maxWidth: 1300, marginLeft: 'auto', marginRight: 'auto' }}
    >
      <Chart
        chartType="GeoChart"
        data={[['Country'], ...countries.map((c) => [{ v: c.name, f: i18n(c.name) + ' ' + c.flag}])]}
        width="100%"
        options={{
          backgroundColor: 'transparent',
          defaultColor: '#2096cc',
        }}
        chartEvents={[
          {
            eventName: 'select',
            callback: ({ chartWrapper }) => {
              const chart = chartWrapper.getChart();
              const selection = chart.getSelection();
              if (selection.length === 0) return;
              const region = countries[selection[0].row];
              document.querySelector('#loader-spinner').style.display = 'block';
              router.push('/countries/' + region.slug);
            },
          },
        ]}
      />
    </div>
  );
}
