export const styles = {
  pageContainer: {
    p: { xs: 2, md: 4 },
    maxWidth: '1200px',
    mx: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3,
    flexWrap: 'wrap',
    gap: 2,
  },
  title: {
    fontWeight: 600,
  },
  addButton: {
    borderRadius: '8px',
    textTransform: 'none',
  },
  grid: {
    display: 'grid',
    gap: 2,
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, 1fr)',
      md: 'repeat(3, 1fr)',
      lg: 'repeat(4, 1fr)',
    },
  },
  cardMedia: {
    height: 180,
    objectFit: 'cover',
  },
  // Standard button styles for forms
  primaryButton: {
    bgcolor: '#103E68',
    '&:hover': { bgcolor: '#0d3254' },
    borderRadius: 2,
    fontWeight: 600,
    textTransform: 'none',
    py: 1.5,
  },
  secondaryButton: {
    borderColor: '#103E68',
    color: '#103E68',
    borderRadius: 2,
    fontWeight: 600,
    textTransform: 'none',
    py: 1.5,
    '&:hover': {
      borderColor: '#0d3254',
      bgcolor: 'rgba(16, 62, 104, 0.04)',
    },
  },
};
