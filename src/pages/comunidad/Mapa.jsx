import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Icono personalizado
const vetIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

// Ejemplo de marcadores dinámicos
const ubicaciones = [
  {
    id: 1,
    nombre: "Dr. Juan",
    tipo: "Veterinario",
    position: [12.8654, -85.2072],
  },
  { id: 2, nombre: "Dra. María", tipo: "Agrónoma", position: [12.9, -85.2167] },
  {
    id: 3,
    nombre: "Finca El Sol",
    tipo: "Productor",
    position: [12.75, -85.1],
  },
];

const NicaraguaMap = () => {
  return (
    <MapContainer
      center={[12.8654, -85.2072]} // centro de Nicaragua
      zoom={7}
      style={{ height: "550px", width: "100%", borderRadius: "12px" }}
      minZoom={6}
      maxBounds={[
        [10, -88],
        [15, -82],
      ]} // límites aproximados de Nicaragua
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {ubicaciones.map((u) => (
        <Marker key={u.id} position={u.position} icon={vetIcon}>
          <Popup>
            <strong>{u.nombre}</strong> <br />
            {u.tipo}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default NicaraguaMap;
