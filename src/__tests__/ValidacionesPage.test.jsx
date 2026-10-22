/**
 * Tests de ValidacionesPage y ValidacionCard.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock del módulo de servicios
vi.mock('../features/profiles/services/profilesApi.js', () => ({
  getPendingValidations: vi.fn(),
  getAllValidations: vi.fn(),
  validateSpecialist: vi.fn(),
  getValidationStats: vi.fn(),
}));

import * as profilesService from '../features/profiles/services/profilesApi.js';
import ValidacionesPage from '../components/page/Validaciones/ValidacionesPage.jsx';
import ValidacionCard from '../components/page/Validaciones/ValidacionCard.jsx';

// Mock de MUI theme
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return actual;
});

const mockSpecialist = {
  id: 1,
  user_id: 10,
  profession: 'Veterinario',
  verification_status: 'pending',
  verification_title: { id: 100, url: 'http://example.com/titulo.jpg' },
  verification_student_card: null,
  verification_graduation_letter: null,
  user: { id: 10, full_name: 'Dr. Perez', profile_picture: null },
};

describe('ValidacionCard', () => {
  it('renderiza nombre y profesión del especialista', () => {
    render(<ValidacionCard specialist={mockSpecialist} onValidate={vi.fn()} />);
    expect(screen.getByText('Dr. Perez')).toBeTruthy();
    expect(screen.getByText('Veterinario')).toBeTruthy();
  });

  it('muestra estado "Pendiente" cuando is_validated=false', () => {
    render(<ValidacionCard specialist={mockSpecialist} onValidate={vi.fn()} />);
    expect(screen.getByText('Pendiente')).toBeTruthy();
  });

  it('muestra estado "Validado" cuando status="approved"', () => {
    const validatedSpecialist = { ...mockSpecialist, verification_status: 'approved' };
    render(<ValidacionCard specialist={validatedSpecialist} onValidate={vi.fn()} />);
    expect(screen.getByText('Validado')).toBeTruthy();
  });

  it('botón Validar está habilitado cuando está pendiente', () => {
    render(<ValidacionCard specialist={mockSpecialist} onValidate={vi.fn()} />);
    const btn = screen.getByText('Validar');
    expect(btn.closest('button').disabled).toBe(false);
  });

  it('llama onValidate(userId, "approved", "") al hacer clic en Validar', async () => {
    const onValidate = vi.fn().mockResolvedValue();
    render(<ValidacionCard specialist={mockSpecialist} onValidate={onValidate} />);
    fireEvent.click(screen.getByText('Validar'));
    await waitFor(() => expect(onValidate).toHaveBeenCalledWith(10, "approved", ""));
  });
});

describe('ValidacionesPage', () => {
  beforeEach(() => {
    profilesService.getPendingValidations.mockResolvedValue({
      count: 1,
      results: [mockSpecialist],
    });
    profilesService.getAllValidations.mockResolvedValue([mockSpecialist]);
    profilesService.getValidationStats.mockResolvedValue({
      total_with_documents: 5,
      validated: 3,
      pending: 2,
    });
    profilesService.validateSpecialist.mockResolvedValue({
      ...mockSpecialist,
      verification_status: 'approved',
    });
  });

  it('muestra el título de la página', async () => {
    render(<ValidacionesPage />);
    await waitFor(() => {
      expect(screen.getByText('Validaciones de Especialistas')).toBeTruthy();
    });
  });

  it('muestra estadísticas de validación', async () => {
    render(<ValidacionesPage />);
    await waitFor(() => {
      expect(screen.getByText('5')).toBeTruthy(); // total_with_documents
    });
  });

  it('muestra la card del especialista pendiente', async () => {
    render(<ValidacionesPage />);
    await waitFor(() => {
      expect(screen.getByText('Dr. Perez')).toBeTruthy();
    });
  });

  it('muestra mensaje cuando no hay pendientes', async () => {
    profilesService.getPendingValidations.mockResolvedValue({ count: 0, results: [] });
    render(<ValidacionesPage />);
    await waitFor(() => {
      expect(screen.getByText(/No hay validaciones pendientes/)).toBeTruthy();
    });
  });

  it('muestra error cuando falla la API', async () => {
    profilesService.getPendingValidations.mockRejectedValue(new Error('Error de conexión'));
    profilesService.getValidationStats.mockRejectedValue(new Error('Error de conexión'));
    render(<ValidacionesPage />);
    await waitFor(() => {
      expect(screen.getByText(/Error de conexión/)).toBeTruthy();
    });
  });
});

