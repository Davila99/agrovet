import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";

const SearchBar = ({ onSearchResults }) => {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!q) return;
    setLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        q
      )}&format=json&limit=5`;
      const res = await fetch(url, {
        headers: { "User-Agent": "AgrovetApp - contact@agrovet.app" },
      });
      const data = await res.json();
      onSearchResults(data);
    } catch (e) {
      console.error("Error Nominatim:", e);
      onSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        bgcolor: "#fff",
        borderRadius: "24px",
        boxShadow: "0 2px 8px rgba(60,64,67,.15)",
        px: 2,
        py: 0.5,
        minWidth: 320,
        maxWidth: 480,
      }}
    >
      <TextField
        variant="standard"
        placeholder="Buscar ubicación..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={handleKey}
        InputProps={{
          disableUnderline: true,
          sx: {
            fontSize: 16,
            pl: 1,
            pr: 1,
            bgcolor: "transparent",
          },
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleSearch}
                disabled={loading}
                aria-label="buscar"
                sx={{
                  color: "#4285F4",
                  bgcolor: "transparent",
                  "&:hover": { bgcolor: "#e3e3e3" },
                  borderRadius: "50%",
                  p: 1,
                }}
              >
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        fullWidth
        sx={{
          bgcolor: "transparent",
        }}
      />
    </Box>
  );
};

export default SearchBar;
