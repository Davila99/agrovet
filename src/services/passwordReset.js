import httpClient from "./httpClient";

/**
 * Solicita que el backend genere y envíe un código al teléfono.
 * Usa `httpClient` para aprovechar inyección de token y manejo centralizado.
 */
export async function requestPasswordResetByPhone(phone) {
  try {
    // intentar endpoint recomendado
    try {
      const data = await httpClient("/auth/password-reset/request-phone/", {
        method: "POST",
        body: { phone },
      });
      return { ok: true, data };
    } catch (err) {
      // si es 404, intentar alias legacy sin 'auth' (compatibilidad)
      if (err && err.status === 404) {
        const data = await httpClient("/password-reset/request-phone/", {
          method: "POST",
          body: { phone },
        });
        return { ok: true, data };
      }
      throw err;
    }
  } catch (err) {
    return { ok: false, error: err.message || "Network error" };
  }
}

/**
 * Verifica el código recibido y actualiza la contraseña.
 */
export async function verifyCodeAndResetPassword(phone, code, newPassword) {
  try {
    try {
      const data = await httpClient("/auth/password-reset/verify-phone/", {
        method: "POST",
        body: { phone, code, new_password: newPassword },
      });
      return { ok: true, data };
    } catch (err) {
      if (err && err.status === 404) {
        const data = await httpClient("/password-reset/verify/", {
          method: "POST",
          body: { phone, code, new_password: newPassword },
        });
        return { ok: true, data };
      }
      throw err;
    }
  } catch (err) {
    return { ok: false, error: err.message || "Network error" };
  }
}
