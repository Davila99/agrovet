import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./navigation/nav";

// Páginas
import HomePage from "./pages/Inicio";
import ComunidadPage from "./pages/Comunidad";
import TendenciasPage from "./pages/Tendencias";
import QuienesSomos from "./pages/AcercaDe";
import LoginPage from "./pages/auth/Login";
import NicaraguaMap from "./pages/comunidad/Mapa";
import ChatView from "./pages/comunidad/ChatView";
import RegisterPage from "./pages/auth/Register";
import FeedView from "./pages/comunidad/FeedView";
import ExploreView from "./pages/comunidad/ExploreView";
import Footer from "./pages/Fotter";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/comunidad" element={<ComunidadPage />} />

        <Route path="/comunidad/mapa" element={<NicaraguaMap />} />
        <Route path="/comunidad/chat" element={<ChatView />} />
        <Route path="/comunidad/feed" element={<FeedView />} />
        <Route path="/comunidad/explorar" element={<ExploreView />} />

        <Route path="/tendencias" element={<TendenciasPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/acerca-de" element={<QuienesSomos />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
