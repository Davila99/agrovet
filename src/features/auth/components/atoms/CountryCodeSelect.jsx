import React, { useState, useEffect } from 'react';
import { Select, MenuItem, Typography, Box } from '@mui/material';

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

const CountryCodeSelect = ({ value, onChange, onAutoDetect }) => {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Attempt to detect country on mount if no value is set
        if (!value) {
            setLoading(true);

            // Try IP-based detection first (faster, no permission needed)
            fetch('https://ipapi.co/json/')
                .then(res => res.json())
                .then(data => {
                    if (data && data.country_code) {
                        const found = COUNTRY_CODES.find(c => c.code === data.country_code);
                        if (found) {
                            onChange(found.dial);
                            if (onAutoDetect) onAutoDetect(found.dial);
                            setLoading(false);
                            return;
                        }
                    }
                    throw new Error('Country not found in list');
                })
                .catch(err => {
                    console.warn('IP detection failed, trying geolocation...', err);

                    // Fallback to geolocation if IP detection fails
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            async (pos) => {
                                try {
                                    const { latitude, longitude } = pos.coords;
                                    const res = await fetch(
                                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
                                    );
                                    if (res.ok) {
                                        const data = await res.json();
                                        const countryCode = data.address?.country_code?.toUpperCase();
                                        const found = COUNTRY_CODES.find(c => c.code === countryCode);
                                        if (found) {
                                            onChange(found.dial);
                                            if (onAutoDetect) onAutoDetect(found.dial);
                                        }
                                    }
                                } catch (e) {
                                    console.warn('Geolocation reverse geocode failed', e);
                                } finally {
                                    setLoading(false);
                                }
                            },
                            (geoErr) => {
                                console.warn('Geolocation denied or failed', geoErr);
                                setLoading(false);
                            },
                            { timeout: 5000 }
                        );
                    } else {
                        setLoading(false);
                    }
                });
        }
    }, []);

    return (
        <Select
            value={value || '+591'} // Default to Bolivia if empty
            onChange={(e) => onChange(e.target.value)}
            variant="standard"
            disableUnderline
            sx={{
                mr: 1,
                '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    py: 0,
                    pr: '24px !important', // Make room for arrow
                },
            }}
            MenuProps={{
                PaperProps: {
                    sx: { maxHeight: 300 }
                }
            }}
        >
            {COUNTRY_CODES.map((country) => (
                <MenuItem key={country.code} value={country.dial}>
                    <Box component="span" sx={{ fontSize: '1.2rem', mr: 1 }}>{country.flag}</Box>
                    <Typography variant="body2" component="span" color="text.secondary">
                        {country.dial}
                    </Typography>
                </MenuItem>
            ))}
        </Select>
    );
};

export default CountryCodeSelect;
