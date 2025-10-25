// src/components/atoms/Button.tsx
import React from "react";
import MuiButton, { ButtonProps as MuiButtonProps } from "@mui/material/Button";
import { Link as RouterLink } from "react-router-dom";

interface ButtonProps extends MuiButtonProps {
  to?: string;
}

const Button: React.FC<ButtonProps> = ({ to, ...props }) => {
  if (to) {
    return <MuiButton component={RouterLink} to={to} {...props} />;
  }
  return <MuiButton {...props} />;
};

export default Button;
