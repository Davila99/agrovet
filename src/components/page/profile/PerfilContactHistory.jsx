import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
} from "@mui/material";

const getAvatarSrc = (item) => {
  return (
    item.profile_picture ||
    item.avatar ||
    (item.specialist && item.specialist.profile_picture) ||
    (item.user && item.user.profile_picture) ||
    (item.specialist_profile && item.specialist_profile.profile_picture) ||
    null
  );
};

const getDisplayName = (item, idx) => {
  return (
    item.user_display ||
    item.name ||
    item.subject ||
    (item.specialist && item.specialist.user_display) ||
    (item.user && item.user.full_name) ||
    `Contacto #${idx + 1}`
  );
};

const PerfilContactHistory = ({ contactHistory = [] }) => {
  const items = Array.isArray(contactHistory) ? contactHistory : [];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, mt: 4 }}>
      <Typography variant="h6" fontWeight="bold" color="#103E68" mb={2}>
        Historial de contacto
      </Typography>

      {items.length === 0 ? (
        <Typography color="text.secondary">
          No hay historial de contacto.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {items.map((item, idx) => {
            const avatarSrc = getAvatarSrc(item);
            const name = getDisplayName(item, idx);
            const message = item.message || item.description || item.note || "";
            const date = item.date || item.timestamp || item.created_at || "";

            return (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card
                  sx={{
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 1,
                    height: "100%",
                  }}
                >
                  <Avatar
                    src={avatarSrc || undefined}
                    sx={{ width: 64, height: 64, ml: 1 }}
                  >
                    {!avatarSrc && (name || "").charAt(0).toUpperCase()}
                  </Avatar>

                  <CardContent sx={{ py: 1, px: 2 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {message}
                      </Typography>
                      {date && (
                        <Typography variant="caption" color="text.disabled">
                          {date}
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default PerfilContactHistory;
