import { describe, it, expect } from 'vitest';
import { normalizeMessage, normalizeConversation } from './chatAdapter';

describe('chatAdapter', () => {
    describe('normalizeMessage', () => {
        it('normalizes message with id and text', () => {
            const input = { id: 1, text: 'Hello', sender: { id: 2, name: 'User' } };
            const output = normalizeMessage(input);
            expect(output.id).toBe(1);
            expect(output.text).toBe('Hello');
            expect(output.sender.name).toBe('User');
        });

        it('normalizes message with pk and content', () => {
            const input = { pk: 2, content: 'Hi', author: { id: 3, full_name: 'User2' } };
            const output = normalizeMessage(input);
            expect(output.id).toBe(2);
            expect(output.text).toBe('Hi');
            expect(output.sender.name).toBe('User2');
        });

        it('normalizes attachments', () => {
            const input = { id: 3, attachments: [{ url: 'http://file.com' }] };
            const output = normalizeMessage(input);
            expect(output.attachments).toHaveLength(1);
            expect(output.attachments[0].url).toBe('http://file.com');
        });
    });

    describe('normalizeConversation', () => {
        it('normalizes conversation with participants', () => {
            const input = { id: 10, participants: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }] };
            const output = normalizeConversation(input);
            expect(output.id).toBe(10);
            expect(output.participants).toHaveLength(2);
            expect(output.participants[0].name).toBe('A');
        });

        it('normalizes last_message', () => {
            const input = { id: 11, last_message: { id: 5, text: 'Last' } };
            const output = normalizeConversation(input);
            expect(output.last_message.text).toBe('Last');
        });
    });
});
