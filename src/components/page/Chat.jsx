import React from 'react';
import { Box, Typography } from '@mui/material';

// STUB: Chat component disabled during migration
export default function Chat() {
    return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
                Chat feature temporarily unavailable
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Migration in progress
            </Typography>
        </Box>
    );
}
