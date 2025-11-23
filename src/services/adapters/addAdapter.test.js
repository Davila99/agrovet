import { describe, it, expect } from 'vitest';
import { normalizeAdd } from './addAdapter';

describe('addAdapter', () => {
    it('normalizes add with id and title', () => {
        const input = { id: 10, title: 'Tractor', price: 1000 };
        const output = normalizeAdd(input);
        expect(output.id).toBe(10);
        expect(output.title).toBe('Tractor');
        expect(output.price).toBe(1000);
    });

    it('normalizes add with pk and name', () => {
        const input = { pk: 11, name: 'Seeds', price: 50 };
        const output = normalizeAdd(input);
        expect(output.id).toBe(11);
        expect(output.title).toBe('Seeds');
    });

    it('normalizes images array of strings', () => {
        const input = { id: 12, images: ['http://img1.com', 'http://img2.com'] };
        const output = normalizeAdd(input);
        expect(output.images).toHaveLength(2);
        expect(output.images[0].url).toBe('http://img1.com');
    });

    it('normalizes images array of objects', () => {
        const input = { id: 13, images: [{ id: 1, url: 'http://img1.com' }] };
        const output = normalizeAdd(input);
        expect(output.images[0].id).toBe(1);
        expect(output.images[0].url).toBe('http://img1.com');
    });
});
