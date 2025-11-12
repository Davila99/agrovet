import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import AddList from './AddList';
import AddFilterBar from '../molecules/AddFilterBar';
import { styles } from '../styles/addStyles';

export default function AddPage() {
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

      <AddFilterBar />

      <AddList />
    </Box>
  );
}
