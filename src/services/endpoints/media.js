import httpClient from "../httpClient";
import env from "../env";
import mediaAdapter from "../adapters/mediaAdapter";
import authClient from "../authClient";
import { authHeaders } from "./utils";

// Upload a file (FormData) to the media-service. Returns normalized media.
export async function uploadMedia(formData, token) {
  // Build absolute URL to media-service upload endpoint. Common path: /media/ or /media/uploads/
  const url = env.buildUrl('MEDIA', '/media/');
  const localToken = token || (typeof window !== "undefined" ? authClient.getAccessToken() : null);
  const headers = authHeaders(localToken);

  const res = await httpClient(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  // Normalize response to { id, url, name }
  try {
    return mediaAdapter.normalizeMedia(res);
  } catch (e) {
    return res;
  }
}

export async function getMedia(id) {
  const url = env.buildUrl('MEDIA', `/media/${id}/`);
  const res = await httpClient(url, { method: 'GET' });
  return mediaAdapter.normalizeMedia(res);
}

export default {
  uploadMedia,
  getMedia,
};
