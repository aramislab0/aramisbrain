import { describe, it, expect } from 'vitest';
import { generateWeeklyTrajectories } from '../trajectories';

describe('Oracle Trajectories Generator', () => {
    it('should generate exactly 3 trajectories', async () => {
        const trajectories = await generateWeeklyTrajectories();
        expect(trajectories).toHaveLength(3);
    });

    it('should have valid trajectory structure', async () => {
        const trajectories = await generateWeeklyTrajectories();

        trajectories.forEach(traj => {
            expect(traj).toHaveProperty('trajectoryNumber');
            expect(traj).toHaveProperty('title');
            expect(traj).toHaveProperty('context');
            expect(traj).toHaveProperty('whatItMeans');
            expect(traj).toHaveProperty('tradeoffs');
            expect(traj).toHaveProperty('questions');
            expect(traj.questions).toBeInstanceOf(Array);
            expect(traj.questions.length).toBeGreaterThanOrEqual(1);
        });
    });

    it('should have calm tone (no aggressive language)', async () => {
        const trajectories = await generateWeeklyTrajectories();

        trajectories.forEach(traj => {
            const allText = `${traj.title} ${traj.context} ${traj.whatItMeans}`.toLowerCase();

            // No aggressive / alarmist words
            expect(allText).not.toContain('urgent');
            expect(allText).not.toContain('critique');
            expect(allText).not.toContain('alarme');
            expect(allText).not.toContain('danger');
            expect(allText).not.toContain('échec');
        });
    });

    it('should have focus allocation summing close to 100%', async () => {
        const trajectories = await generateWeeklyTrajectories();

        trajectories.forEach(traj => {
            const total = Object.values(traj.focusAllocation).reduce(
                (sum: number, val: number) => sum + val,
                0
            );
            expect(total).toBeGreaterThanOrEqual(95);
            expect(total).toBeLessThanOrEqual(105);
        });
    });

    it('should number trajectories 1-3', async () => {
        const trajectories = await generateWeeklyTrajectories();
        const numbers = trajectories.map(t => t.trajectoryNumber).sort();
        expect(numbers).toEqual([1, 2, 3]);
    });

    it('should have valid tone values', async () => {
        const trajectories = await generateWeeklyTrajectories();
        const validTones = ['opportunity', 'neutral', 'gentle_attention'];

        trajectories.forEach(traj => {
            expect(validTones).toContain(traj.tone);
        });
    });
});
