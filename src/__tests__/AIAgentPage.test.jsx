/**
 * Tests para AIAgentPage y ai.js endpoint service.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

vi.mock('../services/endpoints/ai.js', () => ({
  sendChatMessage: vi.fn(),
  sendVoiceChat: vi.fn(),
  getIndexedBooks: vi.fn(),
}));

import * as aiService from '../services/endpoints/ai.js';
import AIAgentPage from '../components/page/AIAgent/AIAgentPage.jsx';

describe('AIAgentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    aiService.getIndexedBooks.mockResolvedValue({ books: ['Manual_Veterinario.pdf'] });
    aiService.sendChatMessage.mockResolvedValue({
      response: 'El tratamiento para fiebre en bovinos requiere antipiréticos.',
      cards: { severity: 'MEDIUM', species: 'Bovino', recommendations: ['Administrar antipirético'] },
    });
  });

  it('renderiza título y campo de texto', async () => {
    render(<AIAgentPage />);
    await waitFor(() => {
      expect(screen.getByText(/AgroVet IA/)).toBeTruthy();
      expect(screen.getByPlaceholderText(/Escribe tu consulta/)).toBeTruthy();
    });
  });

  it('muestra libros RAG indexados cuando la API responde', async () => {
    render(<AIAgentPage />);
    await waitFor(() => {
      expect(screen.getByText(/1 libros RAG/)).toBeTruthy();
    });
  });

  it('envía consulta de texto al presionar enviar', async () => {
    render(<AIAgentPage />);
    const input = screen.getByPlaceholderText(/Escribe tu consulta/);

    fireEvent.change(input, { target: { value: 'Ternero con fiebre' } });
    const form = input.closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(aiService.sendChatMessage).toHaveBeenCalledWith('Ternero con fiebre', expect.any(String));
      expect(screen.getByText(/tratamiento para fiebre/)).toBeTruthy();
    });
  });
});
