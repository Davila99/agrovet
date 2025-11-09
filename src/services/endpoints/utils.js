// Small helpers shared by endpoints modules
export const normalizeToken = (raw) =>
  raw ? String(raw).replace(/^Token\s*/i, "").replace(/^Bearer\s*/i, "") : null;

export const authHeaders = (token) => {
  const t = normalizeToken(token);
  return t ? { Authorization: `Token ${t}` } : {};
};
