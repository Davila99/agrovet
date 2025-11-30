import React from 'react';
import { Select, MenuItem, Box, Typography } from '@mui/material';

// Common country codes - can be expanded
const COUNTRY_CODES = [
    { code: 'BO', dial: '+591', flag: '🇧🇴', name: 'Bolivia' },
    { code: 'NI', dial: '+505', flag: '🇳🇮', name: 'Nicaragua' },
    { code: 'US', dial: '+1', flag: '🇺🇸', name: 'USA' },
    { code: 'MX', dial: '+52', flag: '🇲🇽', name: 'México' },
    { code: 'ES', dial: '+34', flag: '🇪🇸', name: 'España' },
    { code: 'AR', dial: '+54', flag: '🇦🇷', name: 'Argentina' },
    { code: 'CO', dial: '+57', flag: '🇨🇴', name: 'Colombia' },
    { code: 'PE', dial: '+51', flag: '🇵🇪', name: 'Perú' },
    { code: 'CL', dial: '+56', flag: '🇨🇱', name: 'Chile' },
    { code: 'CR', dial: '+506', flag: '🇨🇷', name: 'Costa Rica' },
    { code: 'GT', dial: '+502', flag: '🇬🇹', name: 'Guatemala' },
    { code: 'HN', dial: '+504', flag: '🇭🇳', name: 'Honduras' },
    { code: 'SV', dial: '+503', flag: '🇸🇻', name: 'El Salvador' },
    { code: 'PA', dial: '+507', flag: '🇵🇦', name: 'Panamá' },
    { code: 'UY', dial: '+598', flag: '🇺🇾', name: 'Uruguay' },
    { code: 'PY', dial: '+595', flag: '🇵🇾', name: 'Paraguay' },
    { code: 'EC', dial: '+593', flag: '🇪🇨', name: 'Ecuador' },
    { code: 'VE', dial: '+58', flag: '🇻🇪', name: 'Venezuela' },
    { code: 'BR', dial: '+55', flag: '🇧🇷', name: 'Brasil' },
];

const CountryPicker = ({ value, onChange }) => {
    // Find the country object based on the dial code
    const selectedCountry = COUNTRY_CODES.find(c => c.dial === value) || COUNTRY_CODES[0];

    return (
        <Select
            value={value || '+591'}
            onChange={(e) => onChange(e.target.value)}
            fullWidth
            sx={{
                mb: 2,
                '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                },
            }}
        >
            {COUNTRY_CODES.map((country) => (
                <MenuItem key={country.code} value={country.dial}>
                    <Box component="span" sx={{ fontSize: '1.5rem', mr: 1 }}>{country.flag}</Box>
                    <Typography variant="body1">{country.name}</Typography>
                </MenuItem>
            ))}
        </Select>
    );
};

export default CountryPicker;
export { COUNTRY_CODES };
