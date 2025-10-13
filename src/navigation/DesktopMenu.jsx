import React from "react";
import { Box, Button, Menu, MenuItem } from "@mui/material";
import { Link } from "react-router-dom";
import { menuItems, comunidadSubmenu } from "./data";

const DesktopMenu = ({
  comunidadMenuAnchor,
  openComunidadMenu,
  closeComunidadMenu,
}) => (
  <Box
    sx={{
      display: { xs: "none", md: "flex" },
      gap: 3,
      color: "#103e68",
      alignItems: "center",
    }}
  >
    {menuItems.map((item) =>
      item.submenu ? (
        <Box
          key={item.text}
          onMouseEnter={openComunidadMenu}
          onMouseLeave={closeComunidadMenu}
          sx={{ position: "relative" }}
        >
          <Button sx={{ color: "#103e68" }}>{item.text}</Button>
          <Menu
            anchorEl={comunidadMenuAnchor}
            open={Boolean(comunidadMenuAnchor)}
            onClose={closeComunidadMenu}
            MenuListProps={{ onMouseLeave: closeComunidadMenu }}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            {comunidadSubmenu.map((sub) => (
              <MenuItem
                key={sub.text}
                component={Link}
                to={sub.path}
                onClick={closeComunidadMenu}
              >
                {sub.text}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      ) : (
        <Button
          key={item.text}
          component={Link}
          to={item.path}
          sx={{ color: "#103e68" }}
        >
          {item.text}
        </Button>
      )
    )}
  </Box>
);

export default DesktopMenu;
