/**
 * Tests del servicio de validaciones (profiles.js).
 * Usa vitest + fetch mocking nativo.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as profilesService from '../services/endpoints/profiles.js';

// Mock de fetch global
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock de localStorage
const localStorageMock = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() };
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('profiles service', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    localStorageMock.getItem.mockReturnValue('test-token-123');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getPendingValidations', () => {
    it('retorna resultados cuando la respuesta es ok', async () => {
      const mockData = { count: 2, results: [{ user_id: 1, is_validated: false }] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await profilesService.getPendingValidations();
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/pending/'),
        expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Token test-token-123' }) })
      );
    });

    it('lanza error cuando la respuesta no es ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ detail: 'Acceso denegado' }),
      });

      await expect(profilesService.getPendingValidations()).rejects.toThrow('Acceso denegado');
    });
  });

  describe('validateSpecialist', () => {
    it('llama PATCH con verification_status="approved" y retorna perfil actualizado', async () => {
      const mockProfile = { user_id: 5, verification_status: 'approved' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile,
      });

      const result = await profilesService.validateSpecialist(5, 'approved', '');
      expect(result).toEqual(mockProfile);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/validate/5/'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ verification_status: 'approved', admin_comment: '' }),
        })
      );
    });

    it('llama PATCH con verification_status="rejected" y comentario', async () => {
      const mockProfile = { user_id: 5, verification_status: 'rejected' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile,
      });

      const result = await profilesService.validateSpecialist(5, 'rejected', 'Documento ilegible');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/validate/5/'),
        expect.objectContaining({ body: JSON.stringify({ verification_status: 'rejected', admin_comment: 'Documento ilegible' }) })
      );
    });

    it('lanza error si la respuesta no es ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ detail: 'Perfil no encontrado' }),
      });
      await expect(profilesService.validateSpecialist(999, true)).rejects.toThrow('Perfil no encontrado');
    });
  });

  describe('getValidationStats', () => {
    it('retorna estadísticas correctas', async () => {
      const mockStats = { total_with_documents: 10, validated: 7, pending: 3 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      });

      const result = await profilesService.getValidationStats();
      expect(result).toEqual(mockStats);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/stats/'),
        expect.any(Object)
      );
    });
  });

  describe('getAllValidations', () => {
    it('retorna lista de todos los especialistas con docs', async () => {
      const mockList = [{ user_id: 1 }, { user_id: 2 }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockList,
      });

      const result = await profilesService.getAllValidations();
      expect(result).toEqual(mockList);
    });
  });
});
