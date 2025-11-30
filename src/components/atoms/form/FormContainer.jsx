import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

/**
 * FormContainer - Atom component for consistent form sizing
 * 
 * Provides standardized responsive dimensions for all forms:
 * - Standard: For forms with 4+ fields (full height)
 * - Compact: For forms with fewer fields (auto height)
 * 
 * @param {string} title - Form title
 * @param {string} variant - 'standard' | 'compact' (default: 'standard')
 * @param {boolean} elevated - Use Paper elevation (default: true)
 * @param {object} sx - Additional sx props
 * @param {React.ReactNode} children - Form content
 */
const FormContainer = ({ 
  title, 
  variant = 'standard', 
  elevated = true,
  sx = {},
  children 
}) => {
  // Standard form dimensions - responsive
  const containerStyles = {
    standard: {
      width: '100%',
      maxWidth: { xs: '100%', sm: 440, md: 480 },
      minHeight: { xs: 'auto', sm: 480 },
      mx: 'auto',
    },
    compact: {
      width: '100%',
      maxWidth: { xs: '100%', sm: 400, md: 420 },
      minHeight: 'auto',
      mx: 'auto',
    },
  };

  const Wrapper = elevated ? Paper : Box;
  
  const wrapperProps = elevated ? {
    elevation: 4,
    sx: {
      ...containerStyles[variant],
      borderRadius: 3,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      ...sx,
    }
  } : {
    sx: {
      ...containerStyles[variant],
      ...sx,
    }
  };

  return (
    <Wrapper {...wrapperProps}>
      {title && (
        <Box 
          sx={{ 
            background: 'linear-gradient(135deg, #103E68 0%, #1a5a96 100%)',
            p: 2.5,
            textAlign: 'center',
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              color: '#fff',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </Typography>
        </Box>
      )}
      <Box 
        sx={{ 
          p: { xs: 2.5, sm: 3 },
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>
    </Wrapper>
  );
};

export default FormContainer;

