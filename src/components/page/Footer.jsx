import React from "react";
import { Box, Typography, Link } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#103E68",
        color: "white",
        py: 4,
        px: { xs: 2, sm: 4 },
      }}>
      <Box
        sx={{
          display: "grid",
          gap: 3,
          alignItems: "start",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "4fr 5fr 3fr",
          },
        }}>
        <Box>
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
              underline="none">
              kenzad187@gmail.com
            </Link>
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Distribuidor
          </Typography>
          <Typography variant="body2">
            Somos distribuidores autorizados de insumos agropecuarios y
            ofrecemos asesoramiento técnico para productores locales.
            Contáctanos para conocer nuestras ofertas, precios y disponibilidad
            en tu zona.
          </Typography>
        </Box>
        {/* 
            <Box>
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
            </Box> */}
      </Box>
    </Box>
  );
};

export default Footer;
