import React from 'react';
import { Box, TextField, MenuItem, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationPicker from '../atoms/LocationPicker';

export default function AddFilterBar({
  categories = [],
  search = '',
  onSearchChange = () => {},
  onSearch = () => {},
  suggestions = [],
  onSelectSuggestion = () => {},
  category = '',
  onCategoryChange = () => {},
  location = '',
  onLocationChange = () => {},
}) {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
      <Box sx={{ position: 'relative', flex: 1, minWidth: 200 }}>
        <TextField
          label="Buscar"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSearch(); } }}
          sx={{ width: '100%' }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => onSearch()} aria-label="buscar">
                  <SearchIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        {suggestions && suggestions.length > 0 && (
          <Box sx={{ position: 'absolute', left: 0, right: 0, mt: 0.5, bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 1, zIndex: 40, maxHeight: 220, overflow: 'auto' }}>
            {suggestions.map(s => (
              <Box
                key={s.id || s.title}
                onClick={() => {
                  try { onSelectSuggestion(s); } catch (e) {}
                  // if suggestion has text, trigger search immediately
                  const text = s?.title || s?.name || '';
                  if (text) onSearch(text);
                }}
                sx={{ p: 1, cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}
              >
                {s.title || s.name}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <TextField
        label="Categoría"
        select
        variant="outlined"
        size="small"
        sx={{ minWidth: 180 }}
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        InputProps={{ startAdornment: (<InputAdornment position="start"><CategoryIcon fontSize="small" /></InputAdornment>) }}
      >
        <MenuItem value="">Todas</MenuItem>
        {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name || c}</MenuItem>)}
      </TextField>

      <Box sx={{ minWidth: 220 }}>
        <LocationPicker
          value={location}
          onChange={(v) => onLocationChange(v)}
          // pass the whole place object so parent can capture lat/lon if needed
          onSelect={(place) => onLocationChange(place)}
          placeholder="Buscar ciudad o lugar"
        />
      </Box>

      {/* Search is triggered by the end adornment (magnifier) or Enter key; category/location filter on change */}
    </Box>
  );
}
