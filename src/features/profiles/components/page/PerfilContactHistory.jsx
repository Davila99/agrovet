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
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        bgcolor: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: "#103E68",
          mb: 3,
          fontSize: "1.25rem",
        }}
      >
        Historial de Contacto
      </Typography>

      {items.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            px: 2,
            borderRadius: 2,
            bgcolor: "#f8f9fa",
            border: "2px dashed #dee2e6",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              fontWeight: 500,
            }}
          >
            No hay historial de contacto.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {items.map((item, idx) => {
            const avatarSrc = getAvatarSrc(item);
            const name = getDisplayName(item, idx);
            const message = item.message || item.description || item.note || "";
            const date = item.date || item.timestamp || item.created_at || "";

            return (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card
                  sx={{
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    height: "100%",
                    bgcolor: "white",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <Avatar
                    src={avatarSrc || undefined}
                    sx={{
                      width: 64,
                      height: 64,
                      border: "2px solid #e9ecef",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    {!avatarSrc && (name || "").charAt(0).toUpperCase()}
                  </Avatar>

                  <CardContent sx={{ py: 0, px: 0, flex: 1, minWidth: 0 }}>
                    <Stack spacing={0.5}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: "#103E68",
                          fontSize: "1rem",
                        }}
                      >
                        {name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {message}
                      </Typography>
                      {date && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.disabled",
                            fontSize: "0.75rem",
                          }}
                        >
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
    </Paper>
  );
};

export default PerfilContactHistory;
