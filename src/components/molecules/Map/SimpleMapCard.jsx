import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Box, Paper, Typography, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Map, Satellite } from "@mui/icons-material";

const SimpleMapCard = ({ lat, lon, locationName, businessName, title = "Ubicación en el mapa" }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapType, setMapType] = useState("streets"); // 'streets' or 'satellite'

  const styles = {
    streets: {
      version: 8,
      sources: {
        "osm-tiles": {
          type: "raster",
          tiles: [
            "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
            "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
            "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        },
      },
      layers: [
        {
          id: "osm-layer",
          type: "raster",
          source: "osm-tiles",
        },
      ],
    },
    satellite: {
      version: 8,
      sources: {
        "esri-satellite": {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "Tiles &copy; Esri",
        },
      },
      layers: [
        {
          id: "satellite-layer",
          type: "raster",
          source: "esri-satellite",
        },
      ],
    }
  };

  useEffect(() => {
    if (!lat || !lon || !mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styles[mapType],
      center: [lon, lat],
      zoom: 14,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.FullscreenControl(), "top-right");

    map.on("load", () => {
      const popupHtml = `<strong>${locationName || ""}</strong>${businessName ? `<br/>${businessName}` : ""}`;
      new maplibregl.Marker({ color: "#ff6600" })
        .setLngLat([lon, lat])
        .setPopup(new maplibregl.Popup({ offset: 12 }).setHTML(popupHtml))
        .addTo(map);
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lon, locationName, businessName]);

  // Update style without recreating map if possible
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      mapRef.current.setStyle(styles[mapType]);
    }
  }, [mapType]);

  const handleMapTypeChange = (event, newType) => {
    if (newType !== null) {
      setMapType(newType);
    }
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1 }}>
      {title && (
        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif' }}>
          {title}
        </Typography>
      )}
      
      <Box sx={{ position: "relative", width: "100%", height: 300, borderRadius: 2, overflow: "hidden", border: "1px solid rgba(0,0,0,0.1)" }}>
        <Box ref={mapContainerRef} sx={{ width: "100%", height: "100%" }} />
        
        {/* Controles superpuestos */}
        <Box sx={{ position: "absolute", top: 10, left: 10, zIndex: 10, bgcolor: "white", borderRadius: 1, boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}>
          <ToggleButtonGroup
            value={mapType}
            exclusive
            onChange={handleMapTypeChange}
            size="small"
            aria-label="map type"
          >
            <ToggleButton value="streets" aria-label="calles" sx={{ px: 1.5, py: 0.5, textTransform: 'none' }}>
              <Map fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="caption" fontWeight="bold">Mapa</Typography>
            </ToggleButton>
            <ToggleButton value="satellite" aria-label="satélite" sx={{ px: 1.5, py: 0.5, textTransform: 'none' }}>
              <Satellite fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="caption" fontWeight="bold">Satélite</Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
      
      {locationName && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {locationName}
        </Typography>
      )}
    </Box>
  );
};

export default SimpleMapCard;
