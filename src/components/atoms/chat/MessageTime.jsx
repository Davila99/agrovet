import React from 'react';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';

export default function MessageTime({ timestamp }) {
    if (!timestamp) return null;
    
    try {
        const d = typeof timestamp === "string" && /\d{4}-\d{2}-\d{2}T/.test(timestamp)
            ? new Date(timestamp)
            : timestamp instanceof Date
            ? timestamp
            : new Date(timestamp);
        if (!d || Number.isNaN(d.getTime())) return null;
        const timeStr = d.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
        return (
            <Typography variant="caption" sx={{ color: 'gray', fontSize: '0.65rem' }}>
                {timeStr}
            </Typography>
        );
    } catch {
        return null;
    }
}

MessageTime.propTypes = {
    timestamp: PropTypes.string,
};

