import React from "react";
import { Box, Avatar, Typography, IconButton } from "@mui/material";

const ConsumerProfile = ({ user, editing, setEditing }) => {
  const handleEditToggle = () => setEditing((prev) => !prev);
  return (
    <>
      <Box>
        {/* Portada */}
        <Box
          sx={{
            height: 200,
            backgroundColor: "#f0f0f0",
            borderRadius: 2,
            mb: 2,
            position: "relative",
          }}
        >
          <Avatar
            src={user?.profile_picture || undefined}
            sx={{
              width: 100,
              height: 100,
              position: "absolute",
              bottom: -50,
              left: 16,
              border: "2px solid #fff",
            }}
          />
        </Box>
      </Box>
    </>
  );
};

export default ConsumerProfile;
