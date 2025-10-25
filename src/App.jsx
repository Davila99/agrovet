import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/page/navigation/nav.jsx";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme/theme.js";

// Páginas
import HomePage from "./pages/Inicio";
import QuienesSomos from "./pages/AcercaDe";
import LoginPage from "./pages/auth/Login";
import ResetByPhone from "./pages/auth/ResetByPhone";
import NicaraguaMap from "./pages/comunidad/Mapa";
import RegisterPage from "./pages/auth/Register";
import Footer from "./pages/Fotter";
import Perfil from "./pages/profile/Perfil";
import EditUser from "./pages/profile/EditUser";
import ProtectedRoute from "./middleware/ProtectedRoute.jsx";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/mapa" element={<NicaraguaMap />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/reset-phone" element={<ResetByPhone />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/acerca-de" element={<QuienesSomos />} />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil/editar/:id"
            element={
              <ProtectedRoute>
                <EditUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </Router>
    </ThemeProvider>
  );
}

export default App;
