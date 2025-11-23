import { describe, it, expect } from 'vitest';
import { normalizePost } from './postAdapter';

describe('postAdapter', () => {
    it('normalizes post with id and author', () => {
        const input = { id: 1, title: 'T', author: { id: 2, name: 'A' } };
        const output = normalizePost(input);
        expect(output.id).toBe(1);
        expect(output.author.name).toBe('A');
    });

    it('normalizes post with pk and user', () => {
        const input = { pk: 3, title: 'T2', user: { id: 4, name: 'B' } };
        const output = normalizePost(input);
        expect(output.id).toBe(3);
        expect(output.author.name).toBe('B');
    });

    it('normalizes post with post_id and author_info', () => {
        const input = { post_id: 5, title: 'T3', author_info: { user: { id: 6, name: 'C' } } };
        const output = normalizePost(input);
        expect(output.id).toBe(5);
        expect(output.author.name).toBe('C');
    });
});
