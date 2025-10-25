import { createTheme } from "@mui/material/styles";

declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    primary: true;
    primaryBlue: true;
    outlinedBorder: true;
    outline: true;
    ghost: true;
    danger: true;
    link: true;
  }
  interface InputPropsColorOverrides {
    search: true;
    form: true;
  }
}

export const theme = createTheme({
  palette: {
    primary: {
      main: "#006943",
      contrastText: "#fff",
    },
    secondary: {
      main: "#103E68",
      contrastText: "#fff",
    },
  },
  components: {
    MuiButton: {
      variants: [
        {
          props: { variant: "primary" },
          style: {
            backgroundColor: "#006943",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#00522E",
            },
          },
        },
        {
          props: { variant: "primaryBlue" },
          style: {
            borderRadius: "10px",
            backgroundColor: "#103E68",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#006943",
              color: "#fff",
            },
          },
        },
        {
          props: { variant: "outlinedBorder" },
          style: {
            borderRadius: "10px",
            border: "2px solid #103E68",
          },
        },
        {
          props: { variant: "outline" },
          style: {
            borderRadius: "10px",
            color: "#103E68",
            "&:hover": {
              backgroundColor: "rgba(16,62,104,0.04)",
            },
          },
        },
        {
          props: { variant: "ghost" },
          style: {
            backgroundColor: "transparent",
            color: "#103E68",
            "&:hover": {
              backgroundColor: "rgba(0,0,0,0.04)",
            },
          },
        },
        {
          props: { variant: "danger" },
          style: {
            backgroundColor: "#D32F2F",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#B71C1C",
            },
          },
        },
        {
          props: { variant: "link" },
          style: {
            color: "#103E68",
            textDecoration: "underline",
            "&:hover": {
              backgroundColor: "rgba(16,62,104,0.04)",
            },
          },
        },
      ],
    },
  },
});
