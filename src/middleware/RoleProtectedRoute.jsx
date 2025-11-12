import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getProfile } from "../services/endpoints/auth";

const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!token) {
        if (mounted) {
          setAllowed(false);
          setChecking(false);
        }
        return;
      }
      try {
        const profile = await getProfile(token.replace(/^Bearer\s*/i, ""));
        const role = (profile?.role || "").toString().toLowerCase();
        const normalized = allowedRoles.map((r) => r.toString().toLowerCase());
        if (mounted) setAllowed(normalized.includes(role));
      } catch (e) {
        console.error("RoleProtectedRoute error:", e);
        if (mounted) setAllowed(false);
      } finally {
        if (mounted) setChecking(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [token, allowedRoles]);

  if (!token && !checking) {
    return <Navigate to="/login" replace />;
  }

  if (checking) return null; // or a spinner

  if (!allowed) {
    // redirect consumers or other roles to chat (they should only access chats)
    return <Navigate to="/chat" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
