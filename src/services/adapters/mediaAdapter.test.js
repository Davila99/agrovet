import { describe, it, expect } from 'vitest';
import { normalizeMedia } from './mediaAdapter';

describe('mediaAdapter', () => {
    it('normalizes media with id and url', () => {
        const input = { id: 1, url: 'http://example.com/img.jpg' };
        const output = normalizeMedia(input);
        expect(output.id).toBe(1);
        expect(output.url).toBe('http://example.com/img.jpg');
    });

    it('normalizes media with pk and public_url', () => {
        const input = { pk: 2, public_url: 'http://example.com/img2.jpg' };
        const output = normalizeMedia(input);
        expect(output.id).toBe(2);
        expect(output.url).toBe('http://example.com/img2.jpg');
    });

    it('normalizes media with data object', () => {
        const input = { id: 3, data: { url: 'http://example.com/img3.jpg' } };
        const output = normalizeMedia(input);
        expect(output.id).toBe(3);
        expect(output.url).toBe('http://example.com/img3.jpg');
    });
});
