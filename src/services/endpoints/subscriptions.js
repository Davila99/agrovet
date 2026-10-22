/**
 * Servicio para gestión administrativa de suscripciones y cuotas de usuarios.
 */
import httpClient from '../httpClient';
import { authHeaders } from './utils';
import env from '../env';
import authClient from '../../features/auth/services/authClient';

const getAuthToken = () => {
  return typeof window !== 'undefined' ? authClient.getAccessToken() : null;
};

/**
 * Obtener listado de usuarios con estado de suscripción y límites/cuotas.
 * @param {Object} params - { status: 'ALL' | 'ACTIVE' | 'EXPIRED' | 'FREE', search: string }
 */
export async function getAdminSubscriptions(params = {}) {
  const token = getAuthToken();
  const query = new URLSearchParams();
  if (params.status && params.status !== 'ALL') query.append('status', params.status);
  if (params.search) query.append('search', params.search);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const url = env.buildUrl('AUTH', `/admin/subscriptions/${queryString}`);

  const res = await httpClient(url, {
    method: 'GET',
    headers: authHeaders(token),
  });
  return res;
}

/**
 * Obtener estadísticas globales de suscripciones (totales, activos, por vencer, etc.).
 */
export async function getAdminSubscriptionStats() {
  const token = getAuthToken();
  const url = env.buildUrl('AUTH', '/admin/subscriptions/stats/');

  const res = await httpClient(url, {
    method: 'GET',
    headers: authHeaders(token),
  });
  return res;
}
