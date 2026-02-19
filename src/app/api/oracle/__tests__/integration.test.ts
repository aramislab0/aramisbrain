import { describe, it, expect } from 'vitest';

describe('Oracle API Integration', () => {
    const baseUrl = 'http://localhost:3000';

    it('should fetch trajectories successfully', async () => {
        const res = await fetch(`${baseUrl}/api/oracle/trajectories?refresh=true`);
        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data.trajectories).toBeDefined();
        expect(Array.isArray(data.trajectories)).toBe(true);
    });

    it('should fetch questions successfully', async () => {
        const res = await fetch(`${baseUrl}/api/oracle/questions?refresh=true`);
        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data.questions).toBeDefined();
        expect(Array.isArray(data.questions)).toBe(true);
    });

    it('should fetch summary successfully', async () => {
        const res = await fetch(`${baseUrl}/api/oracle/summary?refresh=true`);
        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data.summary).toBeDefined();
    });

    it('should return calm tone in API responses', async () => {
        const [trajRes, qRes, sumRes] = await Promise.all([
            fetch(`${baseUrl}/api/oracle/trajectories?refresh=true`),
            fetch(`${baseUrl}/api/oracle/questions?refresh=true`),
            fetch(`${baseUrl}/api/oracle/summary?refresh=true`),
        ]);

        const trajData = await trajRes.json();
        const qData = await qRes.json();
        const sumData = await sumRes.json();

        expect(trajData.tone).toBe('calm');
        expect(qData.tone).toBeDefined();
        expect(sumData.tone).toBe('calm');
    });

    it('should handle cached responses (no refresh)', async () => {
        const res = await fetch(`${baseUrl}/api/oracle/trajectories`);
        expect(res.status).toBe(200);

        const data = await res.json();
        // Should return from cache or generate
        expect(data).toBeDefined();
    });
});
