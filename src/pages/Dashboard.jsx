import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  ListItemIcon,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import Chat from "./Chat";

const Dashboard = () => {
  const [selected, setSelected] = useState("chat");
  const isMd = useMediaQuery("(min-width:900px)");

  const Menu = (
    <Paper sx={{ p: 1, borderRadius: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1, px: 1 }}>
        Panel
      </Typography>
      <List>
        <ListItemButton
          selected={selected === "chat"}
          onClick={() => setSelected("chat")}
          sx={{ borderRadius: 1, mb: 0.5 }}
        >
          <ListItemIcon sx={{ minWidth: 38 }}>
            <ChatBubbleOutlineIcon />
          </ListItemIcon>
          <ListItemText primary="Chat" />
        </ListItemButton>
        {/* Mapa movido al nav como acceso directo */}
      </List>
    </Paper>
  );

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Panel Admin
      </Typography>
      <Grid container spacing={2}>
        {isMd ? (
          <Grid item md={3} sx={{ display: { xs: "none", md: "block" } }}>
            {Menu}
          </Grid>
        ) : (
          <Grid item xs={12}>
            {Menu}
          </Grid>
        )}

        <Grid item xs={12} md={9}>
          <Paper
            sx={{
              height: { xs: 520, md: "calc(100vh - 160px)" },
              p: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Chat />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
