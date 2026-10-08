import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import ImageCarousel from '../features/marketplace/components/atoms/ImageCarousel';

describe('ImageCarousel', () => {
    it('renders empty box when images list is empty', () => {
        const { container } = render(<ImageCarousel images={[]} />);
        expect(container.firstChild).toBeTruthy();
    });

    it('renders maximum of 5 images and displays pagination signals/dots', () => {
        const testImages = [
            'http://img1.com',
            'http://img2.com',
            'http://img3.com',
            'http://img4.com',
            'http://img5.com',
            'http://img6.com', // 6th image should be ignored
        ];

        render(<ImageCarousel images={testImages} />);

        const renderedImages = screen.getAllByRole('img');
        expect(renderedImages).toHaveLength(5);
        expect(renderedImages[0].src).toContain('http://img1.com');
    });

    it('opens fullscreen modal on fullscreen button click', () => {
        const testImages = ['http://img1.com', 'http://img2.com'];
        render(<ImageCarousel images={testImages} allowFullscreen={true} />);

        const fullscreenBtn = screen.getByLabelText('Pantalla completa');
        expect(fullscreenBtn).toBeTruthy();

        fireEvent.click(fullscreenBtn);

        const closeBtn = screen.getByLabelText('Cerrar vista completa');
        expect(closeBtn).toBeTruthy();
    });
});
