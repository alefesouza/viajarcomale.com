'use client';

import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import Marker from './marker';
import { useState } from 'react';

export default function LocationsMap({ locations, loadingText, resetZoomText, apiKey }) {
  const isBR = typeof window !== 'undefined' && window.location.href.includes('viajarcomale.com.br');

  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lng: 0 });
  const [center, setCenter] = useState({ lat: 0, lng: 0 });

  let mapRef = null;

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    language: isBR ? 'pt' : 'en',
    region: isBR ? 'BR' : 'US',
  });

  const setLocation = (location) => {
    const latLng = {
      lat: parseFloat(location.latitude),
      lng: parseFloat(location.longitude),
    };

    setCurrentLocation(latLng);

    if (mapRef.state.map.getZoom() <= 7) {
      setCenter(latLng)
      mapRef.state.map.setZoom(window.innerWidth < 493 ? 11 : 12);
    }
  }

  const resetZoom = () => {
    setCurrentLocation({
      lat: 0,
      lng: 0,
    })
    mapRef.state.map.setZoom(window.innerWidth < 493 ? 1 : window.innerWidth <= 1440 ? 2 : 3);
  }

  return !isLoaded ? <div className="container-fluid" style={{textAlign: 'center'}}>{loadingText}...</div> : 
    <div>
      <div className="center_link" style={{ marginBottom: 16 }}>
        <button onClick={resetZoom}>{resetZoomText}</button>
      </div>

      <GoogleMap ref={(ref) => mapRef = ref}
        mapContainerStyle={{
          width: '100vw',
          height: window.innerWidth < 493 ? '40vh' : '100vh'
        }}
        zoom={window.innerWidth < 493 ? 1 : window.innerWidth <= 1440 ? 2 : 3}
        center={center}
        mapContainerClassName="map-container"
      >
        {locations.map((l, i) => <Marker location={l} key={i} currentLocation={currentLocation} setLocation={setLocation} isBR={isBR} />)}
      </GoogleMap>

      <div className="center_link" style={{ marginTop: 16 }}>
        <button onClick={resetZoom}>{resetZoomText}</button>
      </div>
    </div>
}
