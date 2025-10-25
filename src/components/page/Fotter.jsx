import React from "react";
import { Box, Typography, Link, Grid } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#103E68",
        color: "white",
        py: 4,
        px: { xs: 2, sm: 4 },
      }}
    >
      <Grid container spacing={3} alignItems="flex-start">
        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Contacto
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            URACCAN NG, Nueva Guinea, Nicaragua
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <Link href="tel:+50586884349" color="inherit" underline="none">
              8688 4349
            </Link>
          </Typography>
          <Typography variant="body2">
            <Link
              href="mailto:kenzad187@gmail.com"
              color="inherit"
              underline="none"
            >
              kenzad187@gmail.com
            </Link>
          </Typography>
        </Grid>

        <Grid item xs={12} sm={5}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Distribuidor
          </Typography>
          <Typography variant="body2">
            Somos distribuidores autorizados de insumos agropecuarios y
            ofrecemos asesoramiento técnico para productores locales.
            Contáctanos para conocer nuestras ofertas, precios y disponibilidad
            en tu zona.
          </Typography>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Síguenos
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <Link
              href="https://www.instagram.com/agrovets12/"
              target="_blank"
              rel="noopener"
              color="inherit"
              underline="hover"
            >
              Instagram: @agrovets12
            </Link>
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              © {new Date().getFullYear()} AgroVets. Todos los derechos
              reservados.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Footer;
