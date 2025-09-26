import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      sx={{ bgcolor: "#103E68", color: "white", py: 3, textAlign: "center" }}>
      <Typography variant="body2">
        © {new Date().getFullYear()} AgroVets. Todos los derechos reservados.
      </Typography>
    </Box>
  );
};

export default Footer
