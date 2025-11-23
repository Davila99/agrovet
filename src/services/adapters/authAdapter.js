// Adapter to normalize authentication responses from auth-service
export function normalizeLoginResponse(res) {
  // Expected shapes: { token: '...', user: { id, full_name, ... } } or { access, refresh, user }
  if (!res) return res;
  const token = res.token || res.access || res.access_token || null;
  const refresh = res.refresh || res.refresh_token || null;
  const user = res.user || res.data || null;
  return { token, refresh, user };
}

export function normalizeUser(raw) {
  if (!raw) return raw;
  const id = raw.id || raw.pk || raw.user_id;
  const full_name = raw.full_name || raw.name || `${raw.first_name || ''} ${raw.last_name || ''}`.trim();
  const email = raw.email || '';
  const phone_number = raw.phone_number || raw.phone || '';
  const role = raw.role || 'user';
  const profile_picture = raw.profile_picture || (raw.profile && raw.profile.avatar) || null;

  return {
    ...raw,
    id,
    full_name,
    email,
    phone_number,
    role,
    profile_picture,
  };
}

export default { normalizeLoginResponse, normalizeUser };
