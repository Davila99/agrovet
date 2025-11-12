import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

import Perfil from "./components/page/profile/Perfil.jsx";
import EditUser from "./components/page/profile/EditUser.jsx";
import ProtectedRoute from "./middleware/ProtectedRoute.jsx";
import RoleProtectedRoute from "./middleware/RoleProtectedRoute.jsx";
import Dashboard from "./components/page/Dashboard.jsx";
import ChatPage from "./components/page/ChatPage";
import Chat from "./components/page/Chat.jsx";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
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
              <RoleProtectedRoute allowedRoles={["specialist", "businessman"]}>
                <Dashboard />
              </RoleProtectedRoute>
            }
          />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chats" element={<Chat />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
