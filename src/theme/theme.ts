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
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  palette: {
    primary: {
      main: "#10B981", // Emerald 500
      contrastText: "#fff",
    },
    secondary: {
      main: "#0F172A", // Slate 900
      contrastText: "#fff",
    },
    background: {
      default: "#F8FAFC", // Slate 50
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A",
      secondary: "#64748B",
    },
    divider: "#E2E8F0",
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          padding: "8px 16px",
          boxShadow: "none",
          "&:active": {
            boxShadow: "none",
          },
        },
        contained: {
          boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          "&:hover": {
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          },
        },
      },
      variants: [
        {
          props: { variant: "primary" },
          style: {
            backgroundColor: "#10B981",
            color: "#fff",
            "&:hover": { backgroundColor: "#059669" },
          },
        },
        {
          props: { variant: "primaryBlue" },
          style: {
            backgroundColor: "#0F172A",
            color: "#fff",
            "&:hover": { backgroundColor: "#1E293B" },
          },
        },
        {
          props: { variant: "outlinedBorder" },
          style: {
            border: "1px solid #E2E8F0",
            color: "#0F172A",
            backgroundColor: "#fff",
            "&:hover": { backgroundColor: "#F1F5F9" },
          },
        },
        {
          props: { variant: "outline" },
          style: {
            border: "1px solid #E2E8F0",
            color: "#64748B",
            "&:hover": { backgroundColor: "#F8FAFC", color: "#0F172A" },
          },
        },
        {
          props: { variant: "ghost" },
          style: {
            color: "#64748B",
            "&:hover": { backgroundColor: "#F1F5F9", color: "#0F172A" },
          },
        },
        {
          props: { variant: "danger" },
          style: {
            backgroundColor: "#EF4444",
            color: "#fff",
            "&:hover": { backgroundColor: "#DC2626" },
          },
        },
        {
          props: { variant: "link" },
          style: {
            color: "#10B981",
            textDecoration: "underline",
            "&:hover": { color: "#059669", backgroundColor: "transparent" },
          },
        },
      ],
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
          border: "1px solid #F1F5F9",
          backgroundImage: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        rounded: {
          borderRadius: "16px",
        },
        elevation1: {
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E2E8F0",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#CBD5E1",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#10B981",
            borderWidth: "1px",
            boxShadow: "0 0 0 2px rgba(16,185,129,0.2)",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          color: "#0F172A",
          boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          borderBottom: "1px solid #F1F5F9",
        },
      },
    },
  },
});
