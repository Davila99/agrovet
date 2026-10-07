import { useState, useEffect } from 'react';

export function useAddFormGeoLocation(setForm) {
  const [currency, setCurrency] = useState({ code: 'BOB', symbol: 'Bs' });

  useEffect(() => {
    let cancelled = false;
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      if (cancelled) return;
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      let locationLabel = `Lat ${lat.toFixed(3)}, Lon ${lon.toFixed(3)}`;
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
        const r = await fetch(url);
        if (r.ok) {
          const j = await r.json();
          const addr = j.address || {};
          locationLabel = addr.city || addr.town || addr.village || addr.hamlet || addr.municipality || addr.county || addr.state || addr.region || j.name || j.display_name || locationLabel;
          try {
            const cc = (addr.country_code || '').toString().toUpperCase();
            const countryCurrencyMap = {
              'US': { code: 'USD', symbol: '$' },
              'NI': { code: 'NIO', symbol: 'C$' },
              'BO': { code: 'BOB', symbol: 'Bs' },
              'AR': { code: 'ARS', symbol: '$' },
              'CL': { code: 'CLP', symbol: '$' },
              'PE': { code: 'PEN', symbol: 'S/' },
              'UY': { code: 'UYU', symbol: '$U' },
              'ES': { code: 'EUR', symbol: '€' },
              'MX': { code: 'MXN', symbol: '$' },
            };
            if (cc && countryCurrencyMap[cc]) {
              setCurrency(countryCurrencyMap[cc]);
            }
          } catch (e) { }
        }
      } catch (e) { }
      setForm(prev => ({ ...prev, location_name: locationLabel, latitude: lat, longitude: lon }));
    }, () => {}, { timeout: 8000, maximumAge: 1000 * 60 * 5 });
    return () => { cancelled = true; };
  }, [setForm]);

  return { currency };
}
