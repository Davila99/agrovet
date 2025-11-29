import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import PropTypes from 'prop-types';

/**
 * Badge de verificación para especialistas
 * Verde: Estudiante (carnet de estudiante)
 * Azul: Médico Titulado (título o carta de egresado)
 */
export default function VerificationBadge({ verificationStatus, verificationType, size = 'small' }) {
  if (!verificationStatus) {
    return null;
  }

  const isStudent = verificationStatus === 'verified_student';
  const isProfessional = verificationStatus === 'verified_professional';
  
  const color = isStudent ? '#4caf50' : '#1976d2'; // Verde para estudiante, azul para profesional
  const iconSize = size === 'small' ? 16 : size === 'medium' ? 20 : 24;
  const fontSize = size === 'small' ? '0.7rem' : size === 'medium' ? '0.75rem' : '0.85rem';

  return (
    <Tooltip title={verificationType || (isStudent ? 'Estudiante Verificado' : 'Médico Titulado Verificado')}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          ml: 0.5,
        }}
      >
        <VerifiedIcon
          sx={{
            color: color,
            fontSize: iconSize,
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
          }}
        />
        {verificationType && (
          <Typography
            sx={{
              color: color,
              fontSize: fontSize,
              fontWeight: 600,
              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            {verificationType}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
}

VerificationBadge.propTypes = {
  verificationStatus: PropTypes.oneOf(['verified_student', 'verified_professional', null]),
  verificationType: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
};




