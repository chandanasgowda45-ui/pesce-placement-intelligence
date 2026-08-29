import { z } from 'zod';

export class ScoreCalibrationService {
    /**
     * Calibrates raw scores against candidate benchmarks to prevent inflation.
     * Logic: Clamps scores and applies multi-factor penalties.
     */
    static calibrate(rawScore: number, context: {
        gpa: number,
        minGpa: number,
        skillMatchCount: number,
        resumeLength: number
    }): number {
        let calibrated = rawScore;

        // 1. GPA Hard-Stop Penalty
        if (context.gpa < context.minGpa) {
            calibrated *= 0.65; // Massive reduction if ineligible
        }

        // 2. Anti-Keyword Stuffing (Density Check)
        // If skills match is high but resume is suspiciously short
        if (context.skillMatchCount > 10 && context.resumeLength < 800) {
            calibrated *= 0.8;
        }

        // 3. Realistic Clamping
        // No candidate is 100% perfect for an automated recruiter resonance engine
        return Math.min(Math.max(calibrated, 5), 96);
    }

    static getRiskLevel(score: number): 'Low' | 'Medium' | 'High' | 'Critical' {
        if (score > 85) return 'Low';
        if (score > 65) return 'Medium';
        if (score > 40) return 'High';
        return 'Critical';
    }

    static generateQualityScore(confidence: number, textLength: number): number {
        // Determines if the resume was detailed enough for AI to actually judge
        const lengthBonus = Math.min(textLength / 2000, 1) * 20;
        const confidenceWeight = (confidence / 100) * 80;
        return Math.round(lengthBonus + confidenceWeight);
    }
}