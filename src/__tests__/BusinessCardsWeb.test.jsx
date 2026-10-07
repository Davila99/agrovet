import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import BusinessCardsWeb from '../components/page/AIAgent/BusinessCardsWeb.jsx';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockBusinesses = [
  {
    user_id: 101,
    business_name: 'Agroveterinaria El Ganadero',
    contact: '+505 8899-1122',
    distance_meters: 350,
    distance_text: 'A 350 metros de ti',
    matched_products: ['Amoxil'],
    has_product: true,
  },
  {
    user_id: 102,
    business_name: 'AgroFarmacia La Hacienda',
    contact: '+505 8765-4321',
    distance_meters: 1200,
    distance_text: 'A 1.2 km de ti',
    matched_products: [],
    has_product: false,
  },
];

describe('BusinessCardsWeb', () => {
  it('renderiza tarjetas de agroveterinarias recomendadas y distancia', () => {
    render(
      <MemoryRouter>
        <BusinessCardsWeb businesses={mockBusinesses} />
      </MemoryRouter>
    );

    expect(screen.getByText('Agroveterinarias Cercanas Recomendadas')).toBeTruthy();
    expect(screen.getByText('Agroveterinaria El Ganadero')).toBeTruthy();
    expect(screen.getByText('A 350 metros de ti')).toBeTruthy();
    expect(screen.getByText('AgroFarmacia La Hacienda')).toBeTruthy();
    expect(screen.getByText('A 1.2 km de ti')).toBeTruthy();
  });

  it('navega al chat al hacer clic en Contactar', () => {
    render(
      <MemoryRouter>
        <BusinessCardsWeb businesses={mockBusinesses} />
      </MemoryRouter>
    );

    const buttons = screen.getAllByText('Contactar / Iniciar Chat');
    fireEvent.click(buttons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard?tab=chat&userId=101');
  });
});
