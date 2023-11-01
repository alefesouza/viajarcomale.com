'use client';

import countries from '@/app/utils/countries';
import { useState } from 'react';
import Chart from 'react-google-charts';
import VisitedCountriesModal from '../visited-countries-modal';
import useI18nClient from '@/app/hooks/use-i18n-client';

export default function VisitedCountries({ isModal }) {
  const i18n = useI18nClient();

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      {isModalOpen && (
        <VisitedCountriesModal onClose={() => setIsModalOpen(false)} />
      )}
      <div
        onClick={() => !isModal && setIsModalOpen(true)}
        style={{ cursor: "pointer", marginBottom: isModal ? 20 : 50 }}
      >
        <Chart
          chartType="GeoChart"
          data={[["Country"], ...countries.map((c) => [{ v: c.name, f: i18n(c.name) + ' ' + c.flag}])]}
          width="100%"
          options={{
            backgroundColor: "transparent",
            defaultColor: "#2096cc",
          }}
        />
      </div>
    </div>
  );
}
