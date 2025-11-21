import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./index.css";
import Navbar from "./components/page/navigation/nav.jsx";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme/theme.js";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ForoRoutes from './pages/Foro';
import Box from '@mui/material/Box';

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
import AddPage from './components/page/AddPage';
import { AddForm, AddDetail } from './components/page/add';
import OrbPage from './components/page/Orb/index.jsx';

import Chat from "./components/page/Chat.jsx";
import ForoPage from "./components/page/ForoPage.jsx";

import AddPage from "./components/page/AddPage";
import { AddForm, AddDetail } from "./components/page/add";

function App() {
  const queryClient = new QueryClient();
  // Development helpers: mock server is optional. To use mock, call
  // import('./pages/Foro/mocks/foroMockServer').then(m => m.startForoMock()) from the console.
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Box component="main" sx={{ flex: 1 }}>
              <Routes>
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
          <Route path="/orb" element={<OrbPage />} />

          <Route path="/foro" element={<ForoPage />} />

          <Route path="/chats" element={<Chat />} />
          {/* Alias: allow /add to redirect to /adds (common typo or short link) */}
          <Route path="/add" element={<Navigate to="/adds" replace />} />
          <Route path="/adds" element={<AddPage />} />
          <Route path="/adds/new" element={<AddForm />} />
          <Route path="/adds/:id" element={<AddDetail />} />
          {/* Foro mounted as nested route to avoid multiple Routes mismatch warnings */}
          <Route path="/foro/*" element={<ForoRoutes />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </Router>
        </Routes>
      </Router>
    </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
