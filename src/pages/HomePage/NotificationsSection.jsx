import { Grid, Card, CardContent, Typography } from "@mui/material";

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

  return (
    <Grid container spacing={2} sx={{ mt: 4, justifyContent:'center' }}>
      {notificaciones.map((n) => (
        <Grid item xs={12} md={4} key={n.id}>
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
        </Grid>
      ))}
    </Grid>
  );
};

export default NotificationsSection;
