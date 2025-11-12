import React from 'react';
import { Box, TextField, MenuItem, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function AddFilterBar({ categories = [], onChange }) {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
      <TextField
        label="Buscar"
        variant="outlined"
        size="small"
        sx={{ flex: 1, minWidth: 200 }}
        InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
      />

      <TextField
        label="Categoría"
        select
        variant="outlined"
        size="small"
        sx={{ minWidth: 180 }}
        InputProps={{ startAdornment: (<InputAdornment position="start"><CategoryIcon fontSize="small" /></InputAdornment>) }}
      >
        <MenuItem value="">Todas</MenuItem>
        <MenuItem value="veterinaria">Veterinaria</MenuItem>
        <MenuItem value="agronomia">Agronomía</MenuItem>
        <MenuItem value="maquinaria">Maquinaria</MenuItem>
      </TextField>

      <TextField
        label="Ubicación"
        variant="outlined"
        size="small"
        sx={{ minWidth: 220 }}
        InputProps={{ startAdornment: (<InputAdornment position="start"><LocationOnIcon fontSize="small" /></InputAdornment>) }}
      />
    </Box>
  );
}
