import React, { useEffect, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import AddList from './AddList';
import AddFilterBar from '../molecules/AddFilterBar';
import { styles } from '../styles/addStyles';
import { addService } from '../../../../services/endpoints/adds';

export default function AddPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [locationLat, setLocationLat] = useState(null);
  const [locationLon, setLocationLon] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  // helper: pick the most specific locality from Nominatim address
  const pickLocality = (addr = {}, fallbackDisplay) => {
    // prefer these more granular fields when available
    const keys = ['suburb', 'neighbourhood', 'quarter', 'hamlet', 'village', 'town', 'city_district', 'city', 'municipality', 'county', 'state', 'region'];
    for (const k of keys) {
      if (addr[k]) return addr[k];
    }
    // fallback to display name parts
    return fallbackDisplay || '';
  };

  // detect user's current location on page load and set default filter location
  useEffect(() => {
    let cancelled = false;
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      if (cancelled) return;
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`;
        const r = await fetch(url);
        if (!r.ok) throw new Error('reverse geocode failed');
        const j = await r.json();
        const addr = j.address || {};
        const locality = pickLocality(addr, j.display_name);
        setLocation(locality);
        setLocationLat(lat);
        setLocationLon(lon);
      } catch (e) {
        console.warn('failed to reverse geocode page location', e);
        // fallback to coords string
        setLocation(`Lat ${lat.toFixed(3)}, Lon ${lon.toFixed(3)}`);
        setLocationLat(lat);
        setLocationLon(lon);
      }
    }, (err) => { console.warn('geolocation error', err); }, { timeout: 8000, maximumAge: 1000 * 60 * 5 });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cats = await addService.getCategories();
        if (!mounted) return;
        const list = Array.isArray(cats) ? cats : (cats.results || []);
        // Prefer a reduced set of core agropecuario categories if present
        const CORE_NAMES = [
          'Medicamentos y salud animal','Alimentos y suplementos','Productos para ganado','Semillas y plantas','Fertilizantes y agroquímicos','Maquinaria e implementos','Herramientas e insumos','Servicios agropecuarios'
        ];
        // Map names to existing categories preserving id; if none present, keep full list
        const coreFound = list.filter(c => CORE_NAMES.includes((c.name || '').toString()));
        setCategories(coreFound.length ? coreFound : list);
      } catch (e) {
        console.warn('failed loading categories', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Suggestion fetch: when search (draft) changes, fetch top 6 matching adds for suggestions
  useEffect(() => {
    let mounted = true;
    const t = setTimeout(async () => {
      if (!search || search.length < 2) {
        if (mounted) setSuggestions([]);
        return;
      }
      try {
        const res = await addService.getAdds({ q: search, page_size: 6 });
        const items = res?.results || res || [];
        if (mounted) setSuggestions(items.slice(0,6));
      } catch (e) {
        console.warn('suggestion fetch failed', e);
      }
    }, 250);
    return () => { mounted = false; clearTimeout(t); };
  }, [search]);
  return (
    <Box sx={styles.pageContainer} className="fade-in">
      <Box sx={styles.header}>
        <Typography variant="h5" sx={styles.title}>Marketplace AgroVet</Typography>
        <Button
          component={Link}
          to="/adds/new"
          variant="contained"
          sx={{
            backgroundColor: '#1877f2',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            '&:hover': { backgroundColor: '#166fe0' },
          }}
        >
          Publicar anuncio
        </Button>
      </Box>

      <AddFilterBar
        categories={categories}
        search={search}
        onSearchChange={setSearch}
    onSearch={(text) => { const t = (typeof text === 'string' && text.length) ? text : search; setSearch(t); setSearchQuery(t); }}
        suggestions={suggestions}
        onSelectSuggestion={(s) => {
          // Apply suggestion as a filter (do not redirect to detail)
          const text = s?.title || s?.name || '';
          setSearch(text);
          setSearchQuery(text);
          setSuggestions([]);
        }}
        category={category}
        onCategoryChange={setCategory}
        location={location}
        onLocationChange={(val) => {
          // val may be a place object (from picker) or a string
          if (val && typeof val === 'object' && (val.lat || val.lon)) {
            setLocation(val.display_name || '');
            setLocationLat(val.lat);
            setLocationLon(val.lon);
          } else {
            setLocation(String(val || ''));
            // clear lat/lon when free-text entered
            setLocationLat(null);
            setLocationLon(null);
          }
        }}
      />

      <AddList filters={{ q: searchQuery, category, location, lat: locationLat, lon: locationLon }} />
    </Box>
  );
}
