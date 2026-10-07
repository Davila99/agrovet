import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import AddFormImagePicker from '../components/page/add/AddFormImagePicker';

describe('AddFormImagePicker', () => {
    it('renders placeholder when no image is selected', () => {
        const form = { main_image: null, secondary_images: [] };
        render(<AddFormImagePicker form={form} setForm={vi.fn()} setSnack={vi.fn()} />);

        expect(screen.getByText(/Seleccionar fotos \(Máx\. 5\)/i)).toBeTruthy();
        expect(screen.getByText(/Solo se previsualizará la 1ª foto elegida/i)).toBeTruthy();
    });

    it('previews only the 1st image selected and displays badge count', () => {
        const form = {
            main_image: 'http://first-selected-image.com/pic.jpg',
            secondary_images: ['http://sec1.com', 'http://sec2.com'],
        };

        render(<AddFormImagePicker form={form} setForm={vi.fn()} setSnack={vi.fn()} />);

        const img = screen.getByRole('img');
        expect(img.src).toContain('http://first-selected-image.com/pic.jpg');
        expect(screen.getByText(/3 \/ 5 fotos \(1ª elegida \+ 2 secundarias\)/i)).toBeTruthy();
    });
});
