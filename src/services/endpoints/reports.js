/**
 * Servicio frontend para el sistema de reporte de usuarios y gestión admin.
 */

const getBaseUrl = () => {
  return (
    import.meta.env?.VITE_PROFILES_SERVICE_URL?.replace('/profiles', '') ||
    import.meta.env?.VITE_GATEWAY_URL ||
    'http://localhost:8003/api'
  );
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
};

/**
 * Reportar a un usuario.
 * @param {number|string} reportedUserId - ID del usuario a reportar
 * @param {string} reason - Código de razón (spam, harassment, fake_profile, fraud, unauthorized_practice, other)
 * @param {string} details - Descripción o comentarios adicionales
 */
export async function createReport(reportedUserId, reason, details = '') {
  const res = await fetch(`${getBaseUrl()}/profiles/reports/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      reported_user_id: reportedUserId,
      reason,
      details,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.reported_user_id || `Error ${res.status} al enviar reporte.`);
  }
  return res.json();
}

/**
 * Obtener todos los reportes para el panel admin.
 * @param {string} statusFilter - Opcional ('pending', 'resolved', 'dismissed')
 */
export async function getAdminReports(statusFilter = '') {
  const query = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : '';
  const res = await fetch(`${getBaseUrl()}/profiles/reports/admin/list/${query}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status} al obtener reportes.`);
  }
  return res.json();
}

/**
 * Actualizar el estado de un reporte (resolved / dismissed / pending).
 */
export async function updateReportStatus(reportId, newStatus, banUser = false) {
  const res = await fetch(`${getBaseUrl()}/profiles/reports/admin/${reportId}/status/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: newStatus, ban_user: banUser }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status} al actualizar reporte.`);
  }
  return res.json();
}

/**
 * Actualizar múltiples reportes a la vez.
 */
export async function updateBatchReportStatus(reportIds, newStatus, banUser = false) {
  const res = await fetch(`${getBaseUrl()}/profiles/reports/admin/batch_status/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ report_ids: reportIds, status: newStatus, ban_user: banUser }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status} al actualizar reportes.`);
  }
  return res.json();
}

/**
 * Obtener estadísticas de reportes para admin.
 */
export async function getReportStats() {
  const res = await fetch(`${getBaseUrl()}/profiles/reports/admin/stats/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status} al obtener estadísticas.`);
  }
  return res.json();
}

/**
 * Aplicar veredicto estructurado a un reporte.
 */
export async function applyReportVerdict(reportId, verdictChoice, adminNotes = '', banChoice = 'none') {
  const res = await fetch(`${getBaseUrl()}/profiles/reports/admin/${reportId}/verdict/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ verdict_choice: verdictChoice, admin_notes: adminNotes, ban_choice: banChoice }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status} al aplicar veredicto.`);
  }
  return res.json();
}

/**
 * Revierte el veredicto previo de un reporte.
 */
export async function revertReportVerdict(reportId) {
  const res = await fetch(`${getBaseUrl()}/profiles/reports/admin/${reportId}/revert_verdict/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status} al revertir veredicto.`);
  }
  return res.json();
}
