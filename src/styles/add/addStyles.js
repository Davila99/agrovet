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
};
