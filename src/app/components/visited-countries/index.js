'use client';

import countries from '@/app/utils/countries';
import { useState } from 'react';
import Chart from 'react-google-charts';
import VisitedCountriesModal from '../visited-countries-modal';
import useI18nClient from '@/app/hooks/use-i18n-client';
import { useRouter } from 'next/navigation';

export default function VisitedCountries({ isModal, onCloseModal }) {
  const router = useRouter()
  const i18n = useI18nClient();

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      {isModalOpen && (
        <VisitedCountriesModal onClose={() => setIsModalOpen(false)} />
      )}
      <div
        onClick={() => !isModal && setIsModalOpen(true)}
        style={{ cursor: 'pointer', marginBottom: isModal ? 20 : 50 }}
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
                if (!isModal) return;

                const chart = chartWrapper.getChart();
                const selection = chart.getSelection();
                if (selection.length === 0) return;
                const region = countries[selection[0].row];
                document.querySelector('#loader-spinner').style.display = 'block';
                router.push('/countries/' + region.slug);
                onCloseModal();
              },
            },
          ]}
        />
      </div>
    </div>
  );
}
