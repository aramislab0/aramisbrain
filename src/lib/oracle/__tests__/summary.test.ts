import { describe, it, expect } from 'vitest';
import { generateWeeklySummary } from '../summary';

describe('Oracle Weekly Summary Generator', () => {
    it('should generate complete summary structure', async () => {
        const summary = await generateWeeklySummary();

        expect(summary).toHaveProperty('weekStartDate');
        expect(summary).toHaveProperty('weekEndDate');
        expect(summary).toHaveProperty('overviewNarrative');
        expect(summary).toHaveProperty('whatAdvances');
        expect(summary).toHaveProperty('needsAttention');
        expect(summary).toHaveProperty('decisionsMade');
        expect(summary).toHaveProperty('fullSummaryMarkdown');
    });

    it('should have calm narrative tone', async () => {
        const summary = await generateWeeklySummary();

        const narrative = summary.overviewNarrative.toLowerCase();

        // Avoid alarmist language
        expect(narrative).not.toContain('échec');
        expect(narrative).not.toContain('désastre');
        expect(narrative).not.toContain('catastrophe');
        expect(narrative).not.toContain('urgence');

        // Should have content
        expect(narrative.length).toBeGreaterThan(20);
    });

    it('should generate valid markdown', async () => {
        const summary = await generateWeeklySummary();

        expect(summary.fullSummaryMarkdown).toContain('#');
        expect(summary.fullSummaryMarkdown).toContain('##');
        expect(summary.fullSummaryMarkdown.length).toBeGreaterThan(100);
    });

    it('should have valid date range (weekStart before weekEnd)', async () => {
        const summary = await generateWeeklySummary();

        const start = new Date(summary.weekStartDate);
        const end = new Date(summary.weekEndDate);

        expect(start.getTime()).toBeLessThan(end.getTime());

        // Week should be 6 days gap (Mon-Sun)
        const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        expect(diffDays).toBe(6);
    });

    it('should have all narrative sections with content', async () => {
        const summary = await generateWeeklySummary();

        expect(summary.whatAdvances.length).toBeGreaterThan(5);
        expect(summary.needsAttention.length).toBeGreaterThan(5);
        expect(summary.decisionsMade.length).toBeGreaterThan(5);
    });
});
