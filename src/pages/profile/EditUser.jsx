import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/endpoints";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const data = await authAPI.userById(id, token);
        setUser(data);
      } catch (e) {
        setError("No se pudo cargar el usuario");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // soportar campos anidados como specialist_profile.user_display
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setUser((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]:
            type === "checkbox"
              ? checked
              : type === "number"
              ? value === ""
                ? ""
                : Number(value)
              : value,
        },
      }));
    } else {
      setUser((prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : type === "number"
            ? value === ""
              ? ""
              : Number(value)
            : value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setProfileFile(f);
      // preview opcional
      try {
        const url = URL.createObjectURL(f);
        setUser((prev) => ({ ...prev, profile_picture: url }));
      } catch (err) {}
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (profileFile) {
        const fd = new FormData();
        // campos simples al FormData
        [
          "full_name",
          "last_name",
          "user_display",
          "email",
          "phone_number",
          "role",
          "bio",
          "latitude",
          "longitude",
        ].forEach((k) => {
          if (user[k] !== undefined && user[k] !== null) fd.append(k, user[k]);
        });

        fd.append("profile_picture", profileFile);

        if (user.specialist_profile) {
          fd.append(
            "specialist_profile",
            JSON.stringify(user.specialist_profile)
          );
        }

        await authAPI.updateUser(id, fd, token);
      } else {
        const payload = { ...user };
        // evitar enviar preview blob como profile_picture
        if (
          typeof payload.profile_picture === "string" &&
          payload.profile_picture.startsWith("blob:")
        ) {
          delete payload.profile_picture;
        }
        await authAPI.updateUser(id, payload, token);
      }
      navigate("/perfil");
    } catch (e) {
      setError(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="40vh"
      >
        <CircularProgress />
      </Box>
    );

  if (error) return <Alert severity="error">{error}</Alert>;

  if (!user) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Editar usuario
      </Typography>
      <Box sx={{ display: "grid", gap: 2, maxWidth: 640 }}>
        <TextField
          label="Nombre"
          name="full_name"
          value={user.full_name || ""}
          onChange={handleChange}
        />
        <TextField
          label="Apellido"
          name="last_name"
          value={user.last_name || ""}
          onChange={handleChange}
        />
        <TextField
          label="Biografía"
          name="bio"
          value={user.bio || ""}
          onChange={handleChange}
        />

        <Box>
          <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
            Foto de perfil (subir archivo para reemplazar)
          </Typography>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </Box>

        {/* Campos específicos para especialistas */}
        {(user.role || "").toString().toLowerCase() === "specialist" && (
          <Box
            sx={{ mt: 1, p: 1, borderRadius: 1, bgcolor: "rgba(0,0,0,0.03)" }}
          >
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
              Perfil especialista
            </Typography>
            <TextField
              label="Nombre público"
              name="specialist_profile.user_display"
              value={user.specialist_profile?.user_display || ""}
              onChange={handleChange}
            />
            <TextField
              label="Profesión"
              name="specialist_profile.profession"
              value={user.specialist_profile?.profession || ""}
              onChange={handleChange}
            />
            <TextField
              label="Años de experiencia"
              name="specialist_profile.experience_years"
              type="number"
              value={user.specialist_profile?.experience_years ?? ""}
              onChange={handleChange}
            />
            <TextField
              label="Sobre mí"
              name="specialist_profile.about_us"
              multiline
              minRows={2}
              value={user.specialist_profile?.about_us || ""}
              onChange={handleChange}
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="specialist_profile.can_give_consultations"
                  checked={Boolean(
                    user.specialist_profile?.can_give_consultations
                  )}
                  onChange={handleChange}
                />
              }
              label="Puede dar consultorías"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="specialist_profile.can_offer_online_services"
                  checked={Boolean(
                    user.specialist_profile?.can_offer_online_services
                  )}
                  onChange={handleChange}
                />
              }
              label="Ofrece servicios online"
            />
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EditUser;
