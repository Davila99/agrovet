import { describe, it, expect } from 'vitest';
import { normalizeProfile } from './profileAdapter';

describe('profileAdapter', () => {
    it('normalizes profile with id and name', () => {
        const input = { id: 1, name: 'Dr. Vet', role: 'specialist' };
        const output = normalizeProfile(input);
        expect(output.id).toBe(1);
        expect(output.name).toBe('Dr. Vet');
        expect(output.role).toBe('specialist');
    });

    it('normalizes profile with user object', () => {
        const input = { user_id: 2, user: { full_name: 'Jane Doe', role: 'user' } };
        const output = normalizeProfile(input);
        expect(output.id).toBe(2);
        expect(output.name).toBe('Jane Doe');
        expect(output.role).toBe('user');
    });

    it('normalizes avatar from media object', () => {
        const input = { id: 3, avatar: { url: 'http://img.com/a.jpg' } };
        const output = normalizeProfile(input);
        expect(output.avatar.url).toBe('http://img.com/a.jpg');
    });

    it('normalizes avatar from profile_picture string', () => {
        const input = { id: 4, profile_picture: 'http://img.com/b.jpg' };
        const output = normalizeProfile(input);
        expect(output.avatar.url).toBe('http://img.com/b.jpg');
    });
});
