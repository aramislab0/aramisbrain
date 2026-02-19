import { describe, it, expect } from 'vitest';
import { generateStrategicQuestions } from '../questions';

describe('Oracle Questions Generator', () => {
    it('should generate 1-3 questions', async () => {
        const questions = await generateStrategicQuestions();
        expect(questions.length).toBeGreaterThanOrEqual(1);
        expect(questions.length).toBeLessThanOrEqual(3);
    });

    it('should have non-directive tone', async () => {
        const questions = await generateStrategicQuestions();

        questions.forEach(q => {
            const text = q.question.toLowerCase();

            // Questions should be questions
            expect(text).toContain('?');

            // Avoid prescriptive language
            expect(text).not.toContain('tu dois');
            expect(text).not.toContain('il faut');
            expect(text).not.toContain('obligatoire');
        });
    });

    it('should have context and rationale', async () => {
        const questions = await generateStrategicQuestions();

        questions.forEach(q => {
            expect(q.context).toBeTruthy();
            expect(q.context.length).toBeGreaterThan(10);
            expect(q.whyNow).toBeTruthy();
            expect(q.whyNow.length).toBeGreaterThan(10);
        });
    });

    it('should have valid question types', async () => {
        const questions = await generateStrategicQuestions();
        const validTypes = ['reflection', 'decision', 'priority', 'strategy'];

        questions.forEach(q => {
            expect(validTypes).toContain(q.questionType);
        });
    });

    it('should have valid structure per question', async () => {
        const questions = await generateStrategicQuestions();

        questions.forEach(q => {
            expect(q).toHaveProperty('question');
            expect(q).toHaveProperty('context');
            expect(q).toHaveProperty('whyNow');
            expect(q).toHaveProperty('questionType');
        });
    });
});
