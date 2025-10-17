import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Box,
  Select,
  MenuItem,
  Typography,
  Button,
  Paper,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import LayersIcon from "@mui/icons-material/Layers";
import RefreshIcon from "@mui/icons-material/Refresh";
import MyLocationIcon from "@mui/icons-material/MyLocation";

// 🌐 Fuentes de mapas base
const BASE_PROVIDERS = [
  {
    id: "esri-imagery",
    name: "Satélite (Esri)",
    tiles: [
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ],
    attribution: 'Tiles © <a href="https://www.esri.com/">Esri</a>',
  },
  {
    id: "osm-raster",
    name: "Clásico (OSM)",
    tiles: ["https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"],
    subdomains: ["a", "b", "c"],
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  },
  {
    id: "carto-light",
    name: "Claro (Carto)",
    tiles: ["https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"],
    subdomains: ["a", "b", "c", "d"],
    attribution: "&copy; CartoDB",
  },
  {
    id: "carto-dark",
    name: "Oscuro (Carto)",
    tiles: ["https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"],
    subdomains: ["a", "b", "c", "d"],
    attribution: "&copy; CartoDB",
  },
];

// 🧩 Construcción dinámica del estilo MapLibre
const makeStyle = (provider) => ({
  version: 8,
  sources: {
    base: {
      type: "raster",
      // Si el proveedor declara subdomains, expandimos las URLs que contienen {s}
      tiles: (function () {
        if (!provider.subdomains || provider.subdomains.length === 0)
          return provider.tiles;
        // Expandir cada template de tile reemplazando {s} por cada subdominio
        const expanded = [];
        provider.tiles.forEach((t) => {
          provider.subdomains.forEach((s) => {
            expanded.push(t.replace(/{s}/g, s));
          });
        });
        return expanded;
      })(),
      tileSize: provider.tileSize || 256,
      attribution: provider.attribution || "",
    },
  },
  layers: [
    {
      id: "base-layer",
      type: "raster",
      source: "base",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
});

const Mapa3DGratis = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [providerIdx, setProviderIdx] = useState(0);
  const [lastClick, setLastClick] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [center, setCenter] = useState([-86.251389, 12.136389]); // Managua
  const [zoom, setZoom] = useState(7);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: makeStyle(BASE_PROVIDERS[providerIdx]),
      center,
      zoom,
      pitch: 0,
    });

    mapRef.current = map;

    // Controles nativos
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.FullscreenControl(), "top-right");
    map.addControl(
      new maplibregl.ScaleControl({ maxWidth: 80, unit: "metric" })
    );
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
      }),
      "top-right"
    );

    // 📍 Click: agrega marcador
    const onClick = (ev) => {
      const coords = [ev.lngLat.lng, ev.lngLat.lat];
      setLastClick(coords);
      setMarkers((prev) => [...prev, coords]);
      new maplibregl.Marker({ color: "#ff6600" })
        .setLngLat(coords)
        .setPopup(
          new maplibregl.Popup().setHTML(
            `<b>Marcador</b><br/>Lat: ${coords[1].toFixed(
              5
            )}, Lng: ${coords[0].toFixed(5)}`
          )
        )
        .addTo(map);
    };
    map.on("click", onClick);

    map.on("move", () => {
      const c = map.getCenter();
      setCenter([c.lng, c.lat]);
      setZoom(Math.round(map.getZoom() * 100) / 100);
    });

    return () => {
      map.off("click", onClick);
      map.remove();
    };
  }, []);

  // 🗺️ Cambio de tipo de mapa
  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      map.setStyle(makeStyle(BASE_PROVIDERS[providerIdx]));
    }
  }, [providerIdx]);

  // 🔄 Limpiar marcadores
  const handleClearMarkers = () => {
    const map = mapRef.current;
    if (!map) return;
    const els = map.getContainer().querySelectorAll(".maplibregl-marker");
    els.forEach((el) => el.remove());
    setMarkers([]);
    setLastClick(null);
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "600px",
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: 4,
      }}
    >
      <Box ref={mapContainer} sx={{ width: "100%", height: "100%" }} />

      {/* 📍 Panel superior: ubicación (estilo "liquid" — vidrio + gradiente animado) */}
      <Paper
        elevation={3}
        sx={{
          position: "absolute",
          top: 12,
          left: 12,
          p: 1,
          borderRadius: 2,
          color: "white",
          fontSize: "0.85rem",
          backdropFilter: "blur(6px) saturate(120%)",
          boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
          minWidth: 160,
          overflow: "hidden",
          // animated liquid gradient
          background:
            "linear-gradient(135deg, rgba(58,123,213,0.28), rgba(58,213,163,0.18))",
          backgroundSize: "300% 300%",
          animation: "liquidAnim 8s ease-in-out infinite",
          // keyframes
          "@keyframes liquidAnim": {
            "0%": { backgroundPosition: "0% 50%" },
            "50%": { backgroundPosition: "100% 50%" },
            "100%": { backgroundPosition: "0% 50%" },
          },
        }}
      >
        {/* decorative floating blob */}
        <Box
          sx={{
            position: "absolute",
            right: -30,
            top: -20,
            width: 120,
            height: 120,
            borderRadius: "50%",
            filter: "blur(24px)",
            opacity: 0.18,
            background:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.45), rgba(255,255,255,0) 40%)",
            pointerEvents: "none",
          }}
        />

        <Typography variant="caption" display="block">
          🧭 Centro: {center[1].toFixed(4)}, {center[0].toFixed(4)}
        </Typography>
        <Typography variant="caption" display="block">
          🔍 Zoom: {zoom}
        </Typography>
        {lastClick && (
          <Typography variant="caption" display="block">
            📍 Último click: {lastClick[1].toFixed(5)},{" "}
            {lastClick[0].toFixed(5)}
          </Typography>
        )}
      </Paper>

      {/* 🧭 Panel inferior: selector de tipo de mapa y controles (estilo "liquid") */}
      <Paper
        elevation={3}
        sx={{
          position: "absolute",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          p: 0.75,
          borderRadius: 20,
          color: "#000",
          display: "flex",
          alignItems: "center",

          gap: 1,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          animation: "liquidAnimBottom 10s ease-in-out infinite",
          backdropFilter: "blur(6px) saturate(120%)",
          background:
            "linear-gradient(135deg, hsla(0, 0%, 100%, 0.28), rgba(255, 255, 255, 0.55))",
        }}
      >
        {/* subtle animated blob */}
        <Box
          sx={{
            position: "absolute",
            left: -40,
            bottom: -30,
            width: 160,
            height: 160,
            borderRadius: "50%",
            filter: "blur(30px)",
            opacity: 0.12,
            background:
              "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.36), rgba(255,255,255,0) 45%)",
            pointerEvents: "none",
          }}
        />

        <Typography
          variant="body2"
          sx={{
            pl: 1,
            pr: 0.5,
            color: "rgba(255,255,255,0.9)",
            display: { xs: "none", sm: "inline-block" },
          }}
        >
          <LayersIcon fontSize="small" />
        </Typography>

        <Select
          size="small"
          value={providerIdx}
          onChange={(e) => setProviderIdx(Number(e.target.value))}
          sx={{
            minWidth: 220,
            fontSize: "0.85rem",
            borderRadius: 8,
            bgcolor: "transparent",
            // slightly translucent inner background to emulate liquid button
            "& .MuiSelect-select": {
              backgroundColor: "rgba(255,255,255,0.06)",
              padding: "6px 12px",
              borderRadius: 6,
            },
            color: "white",
          }}
        >
          {BASE_PROVIDERS.map((p, idx) => (
            <MenuItem key={p.id} value={idx}>
              {p.name}
            </MenuItem>
          ))}
        </Select>

        <Stack direction="row" spacing={0.5} sx={{ pr: 0.5 }}>
          <Tooltip title="Centrar mapa">
            <IconButton
              size="small"
              onClick={() =>
                mapRef.current?.flyTo({ center, zoom: 7, essential: true })
              }
              sx={{
                bgcolor: "rgba(255,255,255,0.06)",
                borderRadius: 1,
                color: "white",
              }}
            >
              <MyLocationIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Limpiar marcadores">
            <IconButton
              size="small"
              color="inherit"
              onClick={handleClearMarkers}
              sx={{ bgcolor: "rgba(255,255,255,0.06)", borderRadius: 1 }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Mapa3DGratis;
