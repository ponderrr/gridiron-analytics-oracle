import { NameNormalizer } from "./name-utils.ts";

export interface FuzzyMatchResult {
  sleeperId: string;
  candidateName: string;
  score: number;
  method: string;
  confidence: "high" | "medium" | "low";
}

export interface PlayerCandidate {
  sleeper_id: string;
  full_name: string;
  position?: string;
  team?: string;
}

export class FuzzyMatcher {
  private static readonly HIGH_CONFIDENCE_THRESHOLD = 0.92;
  private static readonly MEDIUM_CONFIDENCE_THRESHOLD = 0.8;
  private static readonly MINIMUM_THRESHOLD = 0.75;

  // Simple Dice coefficient implementation (like string-similarity package)
  private static calculateDiceCoefficient(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    if (str1.length < 2 || str2.length < 2) return 0.0;

    const bigrams1 = this.getBigrams(str1);
    const bigrams2 = this.getBigrams(str2);

    const intersection = bigrams1.filter((bigram) => bigrams2.includes(bigram));
    return (2.0 * intersection.length) / (bigrams1.length + bigrams2.length);
  }

  private static getBigrams(str: string): string[] {
    const bigrams: string[] = [];
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.push(str.substring(i, i + 2));
    }
    return bigrams;
  }

  static findBestMatch(
    targetName: string,
    candidates: PlayerCandidate[],
    usePositionFilter = false,
    expectedPosition?: string
  ): FuzzyMatchResult | null {
    const normalizedTarget = NameNormalizer.normalizeName(targetName);
    const targetVariations = NameNormalizer.createNameVariations(targetName);

    let bestMatch: FuzzyMatchResult | null = null;
    let bestScore = 0;

    // Filter candidates by position if specified
    const filteredCandidates =
      usePositionFilter && expectedPosition
        ? candidates.filter((c) => c.position === expectedPosition)
        : candidates;

    for (const candidate of filteredCandidates) {
      const candidateVariations = NameNormalizer.createNameVariations(
        candidate.full_name
      );

      // Try all combinations of variations
      for (const targetVar of targetVariations.variations) {
        for (const candidateVar of candidateVariations.variations) {
          const score = this.calculateDiceCoefficient(targetVar, candidateVar);

          if (score > bestScore && score >= this.MINIMUM_THRESHOLD) {
            bestScore = score;
            bestMatch = {
              sleeperId: candidate.sleeper_id,
              candidateName: candidate.full_name,
              score,
              method: "dice_coefficient",
              confidence: this.getConfidenceLevel(score),
            };
          }
        }
      }
    }

    return bestMatch;
  }

  private static getConfidenceLevel(score: number): "high" | "medium" | "low" {
    if (score >= this.HIGH_CONFIDENCE_THRESHOLD) return "high";
    if (score >= this.MEDIUM_CONFIDENCE_THRESHOLD) return "medium";
    return "low";
  }

  static findMultipleMatches(
    targetName: string,
    candidates: PlayerCandidate[],
    maxResults = 5
  ): FuzzyMatchResult[] {
    const results: FuzzyMatchResult[] = [];
    const normalizedTarget = NameNormalizer.normalizeName(targetName);
    const targetVariations = NameNormalizer.createNameVariations(targetName);

    for (const candidate of candidates) {
      const candidateVariations = NameNormalizer.createNameVariations(
        candidate.full_name
      );
      let bestScore = 0;

      // Find best score for this candidate across all variations
      for (const targetVar of targetVariations.variations) {
        for (const candidateVar of candidateVariations.variations) {
          const score = this.calculateDiceCoefficient(targetVar, candidateVar);
          bestScore = Math.max(bestScore, score);
        }
      }

      if (bestScore >= this.MINIMUM_THRESHOLD) {
        results.push({
          sleeperId: candidate.sleeper_id,
          candidateName: candidate.full_name,
          score: bestScore,
          method: "dice_coefficient",
          confidence: this.getConfidenceLevel(bestScore),
        });
      }
    }

    // Sort by score descending and return top results
    return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
  }
}
