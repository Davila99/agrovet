import { Grid, Typography, Card, CardContent, Box } from '@mui/material';
import { Bar, Pie } from 'react-chartjs-2';

// Importa y registra los componentes de Chart.js
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DashboardPage = () => {
  // Datos de ejemplo para el gráfico de barras (Usuarios por Rol)
  const userData = {
    labels: ['Veterinarios', 'Agrónomos', 'Propietarios'],
    datasets: [
      {
        label: 'Usuarios por Rol',
        data: [300, 150, 800], // Reemplaza con datos reales de tu backend
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
        ],
      },
    ],
  };

  // Datos de ejemplo para el gráfico de pastel (Consultas)
  const consultsData = {
    labels: ['Activas', 'Finalizadas'],
    datasets: [
      {
        label: 'Consultas',
        data: [120, 450], // Reemplaza con datos reales de tu backend
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      },
    ],
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Dashboard de Administración
          </Typography>
        </Grid>
        
        {/* Tarjetas de Métricas Principales */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Usuarios Totales</Typography>
              <Typography variant="h3">1,250</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Consultas Activas</Typography>
              <Typography variant="h3">120</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Anuncios Publicados</Typography>
              <Typography variant="h3">54</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Reportes Pendientes</Typography>
              <Typography variant="h3">7</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráficos */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom>
                Usuarios Registrados por Rol
              </Typography>
              <Bar data={userData} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom>
                Estado de las Consultas
              </Typography>
              <Pie data={consultsData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;