import { describe, it, expect } from 'vitest';
import { normalizeLoginResponse } from './authAdapter';

describe('authAdapter', () => {
    it('normalizes standard login response', () => {
        const input = { token: 'abc', user: { id: 1, full_name: 'Test' } };
        const output = normalizeLoginResponse(input);
        expect(output).toEqual({ token: 'abc', refresh: null, user: { id: 1, full_name: 'Test' } });
    });

    it('normalizes microservice login response with access/refresh', () => {
        const input = { access: 'abc', refresh: 'ref', data: { uuid: 'u1', name: 'Test' } };
        const output = normalizeLoginResponse(input);
        expect(output).toEqual({ token: 'abc', refresh: 'ref', user: { uuid: 'u1', name: 'Test' } });
    });

    it('returns null/undefined if input is null/undefined', () => {
        expect(normalizeLoginResponse(null)).toBeNull();
        expect(normalizeLoginResponse(undefined)).toBeUndefined();
    });
});
