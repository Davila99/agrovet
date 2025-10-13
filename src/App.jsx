import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./navigation/nav.jsx";

// Páginas
import HomePage from "./pages/Inicio";
import QuienesSomos from "./pages/AcercaDe";
import LoginPage from "./pages/auth/Login";
import NicaraguaMap from "./pages/comunidad/Mapa";
import ChatView from "./pages/comunidad/ChatView";
import RegisterPage from "./pages/auth/Register";
import Footer from "./pages/Fotter";
import Perfil from "./pages/profile/Perfil";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/comunidad/mapa" element={<NicaraguaMap />} />
        <Route path="/comunidad/chat" element={<ChatView />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/acerca-de" element={<QuienesSomos />} />
        <Route path="/perfil" element={<Perfil />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
