import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// Simple place search picker using Nominatim (OpenStreetMap).
// Props:
// - value: current string value to display
// - onSelect: function(place) called when user selects a suggestion: { display_name, lat, lon, address }
// - onChange: function(string) for free text changes (optional)
// - placeholder
export default function LocationPicker({ value = '', onSelect = () => {}, onChange = () => {}, placeholder = 'Buscar lugar...' }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const mounted = useRef(true);
  const timer = useRef(null);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; clearTimeout(timer.current); };
  }, []);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    // debounce search
    clearTimeout(timer.current);
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    timer.current = setTimeout(async () => {
      try {
        // Try Nominatim first with a larger limit
        const limit = 12;
        const nomUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&addressdetails=1&limit=${limit}`;
        const r = await fetch(nomUrl);
        if (!r.ok) throw new Error('nominatim failed');
        const js = await r.json();
        if (!mounted.current) return;
        if (Array.isArray(js) && js.length > 0) {
          setSuggestions(js);
          return;
        }

        // Fallback: try Photon (often has more coverage in some regions)
        try {
          const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=${limit}`;
          const rp = await fetch(photonUrl);
          if (!rp.ok) return setSuggestions([]);
          const pj = await rp.json();
          if (!mounted.current) return;
          const feats = (pj.features || []).map(f => {
            const props = f.properties || {};
            const coords = (f.geometry && f.geometry.coordinates) || [];
            return {
              display_name: [props.name, props.city, props.state, props.country].filter(Boolean).join(', '),
              lat: coords[1],
              lon: coords[0],
              address: props,
              place_id: props.osm_id || props.osm_key || JSON.stringify(coords),
            };
          });
          setSuggestions(feats);
          return;
        } catch (e2) {
          console.warn('Photon fallback failed', e2);
          setSuggestions([]);
        }
      } catch (e) {
        console.warn('LocationPicker search failed', e);
        setSuggestions([]);
      }
    }, 260);
    return () => clearTimeout(timer.current);
  }, [query]);

  const handleSelect = (s) => {
    const place = {
      display_name: s.display_name,
      lat: parseFloat(s.lat),
      lon: parseFloat(s.lon),
      address: s.address || {},
    };
    setQuery(place.display_name);
    setSuggestions([]);
    onSelect(place);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        size="small"
        fullWidth
        placeholder={placeholder}
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChange && onChange(e.target.value); }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small" aria-label="buscar-lugar">
                <SearchIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      {suggestions && suggestions.length > 0 && (
        <Box sx={{ position: 'absolute', left: 0, right: 0, mt: 0.5, bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 1, zIndex: 40, maxHeight: 260, overflow: 'auto' }}>
          {suggestions.map(s => (
            <Box key={`${s.place_id}-${s.lat}-${s.lon}`} onClick={() => handleSelect(s)} sx={{ p: 1, cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}>
              {s.display_name}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
