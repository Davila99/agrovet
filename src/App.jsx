import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './index.css';
import Navbar from "./components/page/navigation/nav.jsx";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme/theme.js";

// Páginas
import HomePage from "./components/page/Inicio";
import QuienesSomos from "./components/page/AcercaDe.jsx";
import LoginPage from "./components/page/auth/Login.jsx";
import RegisterPage from "./components/page/auth/Register.jsx";
import ResetByPhone from "./components/page/auth/ResetByPhone";
import NicaraguaMap from "./components/page/map/Mapa.jsx";
import Footer from "./components/page/Fotter.jsx";
import Perfil from "./components/page/profile/Perfil.jsx";
import EditUser from "./components/page/profile/EditUser.jsx";
import ProtectedRoute from "./middleware/ProtectedRoute.jsx";
import Dashboard from "./components/page/Dashboard.jsx";
import ChatPage from "./components/page/ChatPage";
import AddPage from './components/page/AddPage';
import { AddForm, AddDetail } from './components/page/add';


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
          <Route path="/chat" element={<ChatPage />} />
          {/* Alias: allow /add to redirect to /adds (common typo or short link) */}
          <Route path="/add" element={<Navigate to="/adds" replace />} />
          <Route path="/adds" element={<AddPage />} />
          <Route path="/adds/new" element={<AddForm />} />
          <Route path="/adds/:id" element={<AddDetail />} />
        </Routes>
        <Footer />
      </Router>
    </ThemeProvider>
  );
}

export default App;
