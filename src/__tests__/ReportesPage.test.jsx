/**
 * Tests de ReportesPage, ReportCard y ReportUserModal.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock de servicios de reportes
vi.mock('../services/endpoints/reports.js', () => ({
  createReport: vi.fn(),
  getAdminReports: vi.fn(),
  updateReportStatus: vi.fn(),
  getReportStats: vi.fn(),
}));

import * as reportsService from '../services/endpoints/reports.js';
import ReportesPage from '../components/page/Reportes/ReportesPage.jsx';
import ReportCard from '../components/page/Reportes/ReportCard.jsx';
import ReportUserModal from '../features/profiles/components/page/ReportUserModal.jsx';

const mockReport = {
  id: 1,
  reporter_user_id: 10,
  reported_user_id: 20,
  reason: 'spam',
  reason_label: 'Spam o publicidad no deseada',
  details: 'Envío no solicitado',
  status: 'pending',
  created_at: '2026-09-09T08:00:00Z',
  reporter_user: { id: 10, full_name: 'Juan Perez' },
  reported_user: { id: 20, full_name: 'Carlos Bot' },
};

describe('ReportCard', () => {
  it('renderiza reportado y reportante', () => {
    render(<ReportCard report={mockReport} onUpdateStatus={vi.fn()} />);
    expect(screen.getByText('Carlos Bot')).toBeTruthy();
    expect(screen.getByText((content) => content.includes('Juan Perez'))).toBeTruthy();
    expect(screen.getAllByText('Spam o publicidad no deseada').length).toBeGreaterThan(0);
  });

  it('muestra el estado Pendiente por defecto', () => {
    render(<ReportCard report={mockReport} onUpdateStatus={vi.fn()} />);
    expect(screen.getByText('Pendiente')).toBeTruthy();
  });

  it('llama onUpdateStatus con "resolved" al hacer clic en Resolver', async () => {
    const onUpdateStatus = vi.fn().mockResolvedValue();
    render(<ReportCard report={mockReport} onUpdateStatus={onUpdateStatus} />);
    fireEvent.click(screen.getByText('Resolver'));
    await waitFor(() => expect(onUpdateStatus).toHaveBeenCalledWith(1, 'resolved'));
  });
});

describe('ReportUserModal', () => {
  it('renderiza modal con el nombre del usuario a reportar', () => {
    render(<ReportUserModal open={true} onClose={vi.fn()} reportedUser={{ id: 20, full_name: 'Carlos Bot' }} />);
    expect(screen.getByText(/Carlos Bot/)).toBeTruthy();
  });

  it('permite seleccionar una razón y enviar el reporte', async () => {
    reportsService.createReport.mockResolvedValue({ id: 1 });
    render(<ReportUserModal open={true} onClose={vi.fn()} reportedUser={{ id: 20, full_name: 'Carlos Bot' }} />);

    fireEvent.click(screen.getByText(/Enviar Reporte/));
    await waitFor(() => {
      expect(reportsService.createReport).toHaveBeenCalledWith(20, 'spam', '');
    });
  });
});

describe('ReportesPage', () => {
  beforeEach(() => {
    reportsService.getAdminReports.mockResolvedValue([mockReport]);
    reportsService.getReportStats.mockResolvedValue({
      total: 5,
      pending: 2,
      resolved: 3,
    });
  });

  it('renderiza título y lista de reportes', async () => {
    render(<ReportesPage />);
    await waitFor(() => {
      expect(screen.getByText('Reportes de Usuarios')).toBeTruthy();
      expect(screen.getByText('Carlos Bot')).toBeTruthy();
    });
  });

  it('muestra estado de carga sin errores', async () => {
    render(<ReportesPage />);
    await waitFor(() => {
      expect(screen.getByText('5')).toBeTruthy();
    });
  });

  it('renderiza la pestana de Baneados / Resueltos en ReportesPage', async () => {
    render(<ReportesPage />);
    await waitFor(() => {
      expect(screen.getByText(/Baneados/i)).toBeTruthy();
    });
  });
});
