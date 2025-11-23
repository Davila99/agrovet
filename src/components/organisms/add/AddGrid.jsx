import React from 'react';
import { Box } from '@mui/material';
import { styles } from '../../../styles/add/addStyles';

export default function AddGrid({ children }) {
  return <Box sx={styles.grid}>{children}</Box>;
}
