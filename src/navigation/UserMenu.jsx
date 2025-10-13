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
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/endpoints";

const UserMenu = ({ onLogout, user: userProp }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(userProp || null);

  const open = Boolean(anchorEl);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (userProp) return;
        const token = localStorage.getItem("token");
        if (token) {
          const res = await getProfile(token);
          setUser(res);
        }
      } catch (e) {
        console.error("Error cargando usuario:", e);
      }
    };
    loadUser();
  }, [userProp]);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  if (!user) return null;

  return (
    <>
      <IconButton onClick={handleOpen} sx={{ p: 0 }}>
        <Avatar
          alt={user.full_name}
          src={user.profile_picture || undefined}
          sx={{
            bgcolor: "#103e68",
            color: "#fff",
            width: 40,
            height: 40,
            fontWeight: 600,
          }}
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
          <Paper
            elevation={6}
            sx={{
              mt: 1.5,
              minWidth: 270,
              borderRadius: 3,
              p: 2.5,
              bgcolor: "background.paper",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Avatar
                alt={user.full_name}
                src={user.profile_picture || undefined}
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: "#103e68",
                  fontWeight: 600,
                }}
              >
                {!user.profile_picture &&
                  `${user.full_name?.[0] || ""}${user.last_name?.[0] || ""}`}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {user.full_name} {user.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            <Button
              fullWidth
              variant="contained"
              size="small"
              onClick={() => {
                handleClose();
                navigate("/perfil");
              }}
              sx={{
                mb: 1,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                bgcolor: "#103e68",
                color: "#fff",
                ":hover": { bgcolor: "#103e68" },
              }}
            >
              Ver perfil
            </Button>

            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => {
                handleClose();
                navigate("/configuracion");
              }}
              sx={{
                mb: 1,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Configuración
            </Button>

            <Divider sx={{ my: 1.5 }} />

            <Button
              fullWidth
              color="error"
              variant="text"
              onClick={() => {
                handleClose();
                onLogout();
              }}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
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
