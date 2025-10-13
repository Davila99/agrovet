import React, { useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import SearchBar from "./components/SearchBar";

// Icono para la ubicación del usuario / pin de localización
const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const NicaraguaMap = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);

  // Control para centrar en la ubicación del navegador (estilo Google Maps)
  const LocateControl = () => {
    const map = useMap();
    const handleLocate = () => {
      if (!navigator.geolocation) return alert("Geolocalización no soportada");
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          map.setView([latitude, longitude], 13);
          setUserLocation([latitude, longitude]);
          setLoading(false);
        },
        (err) => {
          console.error("Error geolocalización:", err);
          alert("No se pudo obtener la ubicación");
          setLoading(false);
        }
      );
    };

    return (
      <div
        style={{ position: "absolute", bottom: 20, right: 20, zIndex: 1000 }}
      >
        <Tooltip title="Mi ubicación">
          <IconButton
            onClick={handleLocate}
            aria-label="Mi ubicación"
            sx={{
              bgcolor: "#fff",
              boxShadow: 3,
              width: 44,
              "&:hover": { bgcolor: "#f1f1f1" },
              height: 44,
            }}
          >
            <MyLocationIcon sx={{ color: "#103E68" }} />
          </IconButton>
        </Tooltip>
      </div>
    );
  };

  const center = userLocation || [12.8654, -85.2072];

  return (
    <div style={{ position: "relative" }}>
      <MapContainer
        whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
        center={center}
        zoom={7}
        style={{ height: "550px", width: "100%", borderRadius: "12px" }}
        minZoom={6}
        maxBounds={[
          [10, -88],
          [15, -82],
        ]}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>Tú estás aquí</Popup>
          </Marker>
        )}
        <Box
          sx={{
            position: "absolute",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            width: { xs: "90%", sm: "60%", md: "40%" },
            maxWidth: 500,
          }}
        >
          <SearchBar />
        </Box>
        <LocateControl />
      </MapContainer>
      {loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={200}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            bgcolor: "rgba(255,255,255,0.5)",
            zIndex: 2000,
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </div>
  );
};

export default NicaraguaMap;
