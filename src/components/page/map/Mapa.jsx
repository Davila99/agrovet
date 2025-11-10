import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Box, Typography, Paper, Tooltip } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import { motion, AnimatePresence } from "framer-motion";
import fetchUsers from "../../../data/users";
import Navbar from "../navigation/nav.jsx";

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
  const [clickedOnce, setClickedOnce] = useState(false);
  const [locating, setLocating] = useState(false);
  const [open, setOpen] = useState(false);
  const userMarkerRef = useRef(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // revisar query params para centrar el mapa desde enlaces (p. ej. /comunidad/mapa?lat=...&lon=...)
    const params = new URLSearchParams(window.location.search);
    const latParam = params.get("lat");
    const lonParam = params.get("lon");

    let initialCenter = center;
    let initialZoom = zoom;
    let centerFromParams = false;

    if (latParam && lonParam) {
      const latN = parseFloat(latParam);
      const lonN = parseFloat(lonParam);
      if (!isNaN(latN) && !isNaN(lonN)) {
        initialCenter = [lonN, latN];
        initialZoom = 14; // más cercano al abrir desde perfil
        centerFromParams = true;
      }
    }

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: makeStyle(BASE_PROVIDERS[providerIdx]),
      center: initialCenter,
      zoom: initialZoom,
      pitch: 0,
    });

    mapRef.current = map;

    // Controles nativos
    // mover controles nativos a la esquina inferior derecha
    map.addControl(new maplibregl.NavigationControl(), "bottom-right");
    map.addControl(new maplibregl.FullscreenControl(), "bottom-right");
    map.addControl(
      new maplibregl.ScaleControl({ maxWidth: 80, unit: "metric" })
    );
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
      }),
      "bottom-right"
    );

    // 📍 Click: agrega marcador (solo una vez). Ignora clicks sobre marcadores/popup
    const onClick = (ev) => {
      try {
        const orig = ev && ev.originalEvent && ev.originalEvent.target;
        let el = orig;
        while (el) {
          if (
            el.classList &&
            (el.classList.contains("maplibregl-marker") ||
              el.classList.contains("maplibregl-popup"))
          ) {
            // click sobre marcador/popup: ignorar
            return;
          }
          el = el.parentElement;
        }
      } catch (e) {
        // ignore
      }
      const coords = [ev.lngLat.lng, ev.lngLat.lat];
      setLastClick(coords);

      // Si ya existe el marcador del usuario, moverlo en vez de crear uno nuevo
      if (userMarkerRef.current) {
        try {
          userMarkerRef.current.setLngLat(coords);
          const popup = userMarkerRef.current.getPopup();
          if (popup)
            popup.setText(
              `Ubicación marcada — Lat: ${coords[1].toFixed(
                5
              )}, Lng: ${coords[0].toFixed(5)}`
            );
        } catch (e) {
          console.warn("Error al mover user marker:", e);
        }
      } else {
        // crear un pin estándar (color) y un popup simple — sin mailto
        const marker = new maplibregl.Marker({ color: "#ff6600" })
          .setLngLat(coords)
          .setPopup(
            new maplibregl.Popup({ offset: 12 }).setText(
              `Ubicación marcada — Lat: ${coords[1].toFixed(
                5
              )}, Lng: ${coords[0].toFixed(5)}`
            )
          )
          .addTo(map);

        userMarkerRef.current = marker;
        setClickedOnce(true);
      }
    };
    map.on("click", onClick);

    // Cargar usuarios desde la API y renderizar marcadores con foto como icono
    (async () => {
      try {
        const users = await fetchUsers();
        if (Array.isArray(users) && users.length > 0) {
          users.forEach((u) => {
            const lat = parseFloat(u.latitude);
            const lon = parseFloat(u.longitude);
            if (!isFinite(lat) || !isFinite(lon)) return;

            // crear elemento DOM para la imagen de perfil con fallback
            const el = document.createElement("div");
            el.className = "profile-marker";
            el.style.width = "44px";
            el.style.height = "44px";
            el.style.borderRadius = "50%";
            el.style.overflow = "hidden";
            el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.24)";
            el.style.border = "2px solid white";
            el.style.backgroundColor = "#f0f0f0";
            el.style.display = "flex";
            el.style.alignItems = "center";
            el.style.justifyContent = "center";

            const img = document.createElement("img");
            img.src = u.profile_picture || "";
            img.alt = u.full_name || "usuario";
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.objectFit = "cover";

            // si la imagen falla (CORS o 404), usar un placeholder SVG con iniciales
            img.onerror = () => {
              // generar iniciales a partir del nombre
              const name = (u.full_name || u.full_name || "?").trim();
              const parts = name.split(/\s+/).filter(Boolean);
              const initials =
                (parts[0] ? parts[0][0] : "?") + (parts[1] ? parts[1][0] : "");
              const bg = encodeURIComponent("#ffffff");
              const fg = encodeURIComponent("#103E68");
              const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='100%' height='100%' fill='${decodeURIComponent(
                bg
              )}'/><text x='50%' y='50%' dy='0.36em' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='90' fill='${decodeURIComponent(
                fg
              )}'>${initials.toUpperCase()}</text></svg>`;
              img.src =
                "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
              img.style.objectFit = "cover";
            };

            el.appendChild(img);

            const marker = new maplibregl.Marker({
              element: el,
              anchor: "center",
            })
              .setLngLat([lon, lat])
              .setPopup(
                new maplibregl.Popup({ offset: 12 }).setHTML(
                  `<div style="background:#fff;color:#103E68;padding:8px;border-radius:6px;min-width:120px;box-shadow:0 6px 18px rgba(0,0,0,0.12)"><strong style=\"display:block;font-size:0.95rem;margin-bottom:4px;\">${(
                    u.full_name || "Usuario"
                  ).replace(
                    /</g,
                    "&lt;"
                  )}</strong><span style=\"font-size:0.85rem;color:#445660\">${(
                    u.role || ""
                  ).replace(/</g, "&lt;")}</span></div>`
                )
              )
              .addTo(map);

            // guardar referencias para limpieza
            setMarkers((prev) => [...prev, marker]);
          });
        }
      } catch (e) {
        console.warn("No se pudieron cargar usuarios para mapa:", e);
      }
    })();

    // Si las coords venían en la URL, agregar un marcador inicial
    if (centerFromParams) {
      const coords = initialCenter;
      setLastClick(coords);
      setMarkers((prev) => [...prev, coords]);
      new maplibregl.Marker({ color: "#ff6600" })
        .setLngLat(coords)
        .setPopup(
          new maplibregl.Popup().setHTML(
            `<b>Ubicación</b><br/>Lat: ${coords[1].toFixed(
              5
            )}, Lng: ${coords[0].toFixed(5)}`
          )
        )
        .addTo(map);
    }

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
    // eliminar marcador de usuario si existe y permitir volver a marcar
    try {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    } catch (e) {}
    setClickedOnce(false);
  };

  return (
    <>
      <Navbar />
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100vh",
        }}
      >
        <Box ref={mapContainer} sx={{ width: "100%", height: "100%" }} />

        {/* 📍 Panel superior: ubicación (más transparente, estilo Google Maps) */}
        <Paper
          elevation={3}
          sx={{
            position: "absolute",
            top: 90,
            left: 10,

            p: 1,
            borderRadius: 2,
            bgcolor: "rgba(0,0,0,0.32)",
            color: "white",
            fontSize: "0.85rem",
            backdropFilter: "blur(6px)",
            boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
            minWidth: 160,
          }}
        >
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

        {/* Los controles nativos se muestran ahora en bottom-right; se eliminaron los iconos flotantes duplicados */}

        {/* ── Panel central inferior: información de la ubicación seleccionada ── */}
        <Paper
          sx={{
            position: "absolute",
            bottom: 40,
            left: 20,

            bgcolor: "transparent",
          }}
        >
          <Tooltip title="Cambiar tipo de mapa">
            <Paper
              onClick={() => setOpen(!open)}
              elevation={5}
              sx={{
                p: 1,
                width: 50,
                height: 50,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                bgcolor: "white",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "scale(1.06)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                },
              }}
            >
              <MapIcon sx={{ color: "#000000ff" }} />
            </Paper>
          </Tooltip>

          {/* Panel animado con las miniaturas */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    mt: 1,
                    p: 1,
                    borderRadius: 2,
                    bgcolor: "white",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    zIndex: 1200,
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 1,
                    width: 220,
                  }}
                >
                  {BASE_PROVIDERS.map((p, idx) => (
                    <motion.div
                      key={p.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setProviderIdx(idx);
                        setOpen(false);
                      }}
                      style={{
                        borderRadius: 8,
                        overflow: "hidden",
                        position: "relative",
                        cursor: "pointer",
                        boxShadow:
                          idx === providerIdx
                            ? "0 0 0 2px #1976d2 inset"
                            : "0 0 0 1px rgba(0,0,0,0.15) inset",
                        transition: "box-shadow 0.2s ease",
                      }}
                    >
                      <img
                        src={
                          p.id.includes("esri")
                            ? "https://ocdn.eu/pulscms-transforms/1/oH5k9kpTURBXy8wZTY1NDlmMDQzOTMwYzNlZDU5NTFhMGM0MWNmNTkwMS5qcGeSlQM1AM0DUM0B3ZMFzQFjzQGV3gACoTAFoTEA"
                            : p.id.includes("osm")
                            ? "https://b.thumbs.redditmedia.com/_-tFDewWnuXggz7RBtf-c9a69HtU2Bd64VLrU3jyOZo.jpg"
                            : p.id.includes("dark")
                            ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTraeOzakXtVUuTTmYjVdEU-sdbsvaPHltbT1mNc9i1u9F7ikyOk5gMc-o6_goOcTUkp48&usqp=CAU"
                            : "https://www.shutterstock.com/image-vector/small-map-city-260nw-770438665.jpg"
                        }
                        alt={p.name}
                        style={{
                          width: "100%",
                          height: 70,
                          objectFit: "cover",
                          filter:
                            idx === providerIdx ? "none" : "grayscale(30%)",
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          position: "absolute",
                          bottom: 4,
                          left: 4,
                          px: 0.6,
                          py: 0.2,
                          bgcolor: "rgba(0,0,0,0.55)",
                          color: "white",
                          borderRadius: 1,
                          fontSize: "0.7rem",
                        }}
                      >
                        {p.name}
                      </Typography>
                    </motion.div>
                  ))}
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>
        </Paper>
      </Box>
    </>
  );
};

export default Mapa3DGratis;
