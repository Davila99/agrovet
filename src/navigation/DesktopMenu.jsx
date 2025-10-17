import React, { useState } from "react";
import { Box, Button, Menu, MenuItem } from "@mui/material";
import { Link } from "react-router-dom";
import { menuItems, comunidadSubmenu } from "./data";

const DesktopMenu = ({
  comunidadMenuAnchor,
  openComunidadMenu,
  closeComunidadMenu,
  isLoggedIn,
}) => {
  const [adminAnchor, setAdminAnchor] = useState(null);
  return (
    <Box
      sx={{
        display: { xs: "none", md: "flex" },
        gap: 3,
        color: "#103e68",
        alignItems: "center",
      }}
    >
      {menuItems.map(({ text, path, submenu }) =>
        submenu ? (
          <Box
            key={text}
            onMouseEnter={openComunidadMenu}
            onMouseLeave={closeComunidadMenu}
            sx={{ position: "relative" }}
          >
            <Button sx={{ color: "#103e68" }}>{text}</Button>
            <Menu
              anchorEl={comunidadMenuAnchor}
              open={Boolean(comunidadMenuAnchor)}
              onClose={closeComunidadMenu}
              MenuListProps={{ onMouseLeave: closeComunidadMenu }}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
            >
              {comunidadSubmenu.map(({ text: subText, path: subPath }) => (
                <MenuItem
                  key={subText}
                  component={Link}
                  to={subPath}
                  onClick={closeComunidadMenu}
                >
                  {subText}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        ) : (
          <Button
            key={text}
            component={Link}
            to={path}
            sx={{ color: "#103e68" }}
          >
            {text}
          </Button>
        )
      )}

      {isLoggedIn && (
        <Box>
          <Button
            sx={{ color: "#103e68" }}
            onClick={(e) => setAdminAnchor(e.currentTarget)}
          >
            Dashboard
          </Button>
          <Menu
            anchorEl={adminAnchor}
            open={Boolean(adminAnchor)}
            onClose={() => setAdminAnchor(null)}
          >
            <MenuItem
              component={Link}
              to="/dashboard?tab=chat"
              onClick={() => setAdminAnchor(null)}
            >
              Chat
            </MenuItem>
            <MenuItem
              component={Link}
              to="/dashboard?tab=config"
              onClick={() => setAdminAnchor(null)}
            >
              Configuración
            </MenuItem>
          </Menu>
        </Box>
      )}
    </Box>
  );
};

export default DesktopMenu;
