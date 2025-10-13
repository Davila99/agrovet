// src/components/Navbar/UserMenu.jsx
import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  ClickAwayListener,
  Divider,
  Paper,
  Popper,
  Typography,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/endpoints";

const UserMenu = ({ onLogout }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);

  const open = Boolean(anchorEl);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const id = localStorage.getItem("userId");
        if (token && id) {
          const res = await getProfile(id, token);
          setUser(res);
        }
      } catch (e) {
        console.error("Error cargando usuario:", e);
      }
    };
    loadUser();
  }, []);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  if (!user) return null;

  return (
    <>
      <IconButton onClick={handleOpen} sx={{ p: 0 }}>
        <Avatar
          alt={user.full_name}
          src={user.profile_picture || undefined}
          sx={{ bgcolor: "#103E68" }}
        >
          {!user.profile_picture &&
            `${user.full_name?.[0] || ""}${user.last_name?.[0] || ""}`}
        </Avatar>
      </IconButton>

      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-end"
        sx={{ zIndex: (theme) => theme.zIndex.modal + 20 }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Paper elevation={4} sx={{ mt: 1, minWidth: 230, p: 2 }}>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Avatar
                alt={user.full_name}
                src={user.profile_picture || undefined}
              />
              <Box>
                <Typography variant="subtitle1">
                  {user.full_name} {user.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => {
                handleClose();
                navigate("/perfil");
              }}
              sx={{ mb: 1 }}
            >
              Ver perfil
            </Button>

            <Button
              fullWidth
              variant="text"
              size="small"
              onClick={() => {
                handleClose();
                navigate("/configuracion");
              }}
            >
              Configuración
            </Button>

            <Divider sx={{ my: 1 }} />

            <Button
              fullWidth
              color="error"
              onClick={() => {
                handleClose();
                onLogout();
              }}
            >
              Cerrar sesión
            </Button>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

export default UserMenu;
