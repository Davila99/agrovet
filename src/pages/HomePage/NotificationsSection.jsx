import { Grid, Card, CardContent, Typography } from "@mui/material";
import { motion } from "framer-motion";

const NotificationsSection = () => {
  const notificaciones = [
    {
      id: 1,
      titulo: "Nuevo foro abierto",
      texto: "Participa en la discusión sobre control de plagas en frijol.",
    },
    {
      id: 2,
      titulo: "Evento próximo",
      texto: "Webinar sobre nutrición animal — 30 Septiembre, 4:00 PM.",
    },
    {
      id: 3,
      titulo: "Actualización App",
      texto: "Ahora puedes adjuntar fotos en tus consultas en AgroVets.",
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
    }),
  };

  return (
    <Grid container spacing={2} sx={{ mt: 4, justifyContent: "center" }}>
      {notificaciones.map((n, index) => (
        <Grid item xs={12} md={4} key={n.id}>
          <motion.div
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={cardVariants}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" color="#103E68">
                  {n.titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {n.texto}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
};

export default NotificationsSection;
