import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import SubscriptionUserCard from '../components/page/Subscriptions/SubscriptionUserCard';

const mockUser = {
  id: 1,
  full_name: 'Dr. Roberto Gomez',
  phone_number: '+505 8888-8888',
  role: 'Specialist',
  is_premium: true,
  profile_picture: null,
  subscription: {
    id: 10,
    plan_name: 'Premium Mensual',
    status: 'ACTIVE',
    days_left: 5,
    expires_at: '2026-10-27T12:00:00Z',
  },
  quotas: {
    ad_limit: 50,
    ads_used: 10,
    ads_remaining: 40,
    profile_items_limit: 50,
    profile_items_used: 5,
    profile_items_remaining: 45,
  },
};

describe('SubscriptionUserCard', () => {
  it('renderiza datos del usuario y estado premium', () => {
    render(<SubscriptionUserCard user={mockUser} />);
    expect(screen.getByText('Dr. Roberto Gomez')).toBeTruthy();
    expect(screen.getByText('+505 8888-8888')).toBeTruthy();
    expect(screen.getByText('Premium')).toBeTruthy();
    expect(screen.getByText('5 días restantes')).toBeTruthy();
  });

  it('muestra cuotas y recursos disponibles de anuncios e items', () => {
    render(<SubscriptionUserCard user={mockUser} />);
    expect(screen.getByText(/10 \/ 50 \(40 disp\.\)/)).toBeTruthy();
    expect(screen.getByText(/5 \/ 50 \(45 disp\.\)/)).toBeTruthy();
  });
});
