import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import './index.css';
import MobileDrawer from "./components/page/navigation/MobileDrawer";
import SidebarCommunities from './components/organisms/Foro/SidebarCommunities';
import DashboardSidebar from './components/page/DashboardSidebar';
import React, { useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import Box from '@mui/material/Box';
import { theme } from "./theme/theme.js";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ForoRoutes from './components/page/Foro/ForoRoutes';
import ErrorBoundary from './components/common/ErrorBoundary';

// Páginas
import HomePage from "./components/page/Inicio";
import QuienesSomos from "./components/page/AcercaDe.jsx";
import LoginPage from "./components/page/auth/Login.jsx";
import RegisterPage from "./components/page/auth/Register.jsx";
import ResetByPhone from "./components/page/auth/ResetByPhone";
import NicaraguaMap from "./components/page/map/Mapa.jsx";
import Footer from "./components/page/Footer.jsx";
import Perfil from "./components/page/profile/Perfil.jsx";
import EditUser from "./components/page/profile/EditUser.jsx";
import ProtectedRoute from "./middleware/ProtectedRoute.jsx";
import Dashboard from "./components/page/Dashboard.jsx";
import { useParams } from 'react-router-dom';

function DashboardWithParams() {
  const { id } = useParams();
  return <Dashboard initialTab="foro" initialCommunityId={id} />;
}
import Chat from "./components/page/Chat.jsx";
import AddPage from './components/page/AddPage';
import { AddForm, AddDetail } from './components/page/add';
import OrbPage from './components/page/Orb/index.jsx';


function AppContent() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isHome = location.pathname === '/';

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}>
      {/* Left permanent sidebar: show forum blue sidebar on forum pages except community view; show dashboard sidebar on community pages */}
      {location.pathname?.startsWith('/foro') && !location.pathname?.startsWith('/foro/community') && (
        <Box sx={{ display: { xs: 'none', md: 'block' }, width: '280px', position: 'fixed', left: 0, top: 0, height: '100vh', p: 2, bgcolor: 'transparent' }}>
          <SidebarCommunities />
        </Box>
      )}
      {/* Diagnostic log - runtime */}
      {false && console.debug('[App] pathname=', location.pathname, 'showBlueSidebar=', location.pathname?.startsWith('/foro') && !location.pathname?.startsWith('/foro/community'))}

      {/* Dashboard will render its own sidebar when /foro/community is opened inside Dashboard, so avoid mounting it here to prevent duplicates */}

      {/* Dashboard sidebar is rendered by Dashboard itself; avoid mounting a separate copy here */}

      {/* Mobile drawer available for small screens */}
      <MobileDrawer open={drawerOpen} onClose={toggleDrawer(false)} comunidadOpen={false} handleComunidadCollapse={() => {}} isLoggedIn={!!localStorage.getItem('token')} handleLogout={() => { localStorage.removeItem('token'); window.location.reload(); }} user={null} />

        <Box
        component="main"
        sx={{
          flex: 1,
          // Keep navbar flush to the left edge; shift only the forum content using padding
          ml: 0,
          pt: 0,
        }}>
        <Box sx={{ pl: { md: (location.pathname?.startsWith('/foro') && !location.pathname?.startsWith('/foro/community')) ? '280px' : 0 } }}>
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
                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  }
                />
                <Route path="/orb" element={<OrbPage />} />
                {/* Alias: allow /add to redirect to /adds (common typo or short link) */}
                <Route path="/add" element={<Navigate to="/adds" replace />} />
                      <Route path="/adds" element={
                        <ProtectedRoute>
                          <Dashboard initialTab="ads" />
                        </ProtectedRoute>
                      } />
                <Route path="/adds/new" element={<AddForm />} />
                <Route path="/adds/:id" element={<AddDetail />} />
                {/* Specific community route: render inside Dashboard so navbar/sidebar stay consistent */}
                <Route path="/foro/community/:id/*" element={
                  <ProtectedRoute>
                    <DashboardWithParams />
                  </ProtectedRoute>
                } />
                {/* Foro mounted as nested route to avoid multiple Routes mismatch warnings */}
                <Route path="/foro/*" element={<ForoRoutes />} />
              </Routes>
            </Box>
          </Box>
    </Box>
  );
}

function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <Router>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
