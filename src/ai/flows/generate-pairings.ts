'use server';

/**
 * @fileOverview Creates random pairings from a list of teams.
 *
 * - generatePairings - A function that handles creating random pairings.
 * - GeneratePairingsInput - The input type for the generatePairings function.
 * - GeneratePairingsOutput - The return type for the generatePairings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePairingsInputSchema = z.object({
  teams: z.array(z.string()).describe('An array of team names.'),
});

export type GeneratePairingsInput = z.infer<
  typeof GeneratePairingsInputSchema
>;

const PairingSchema = z.tuple([z.string(), z.string()]);

const GeneratePairingsOutputSchema = z.object({
  pairings: z
    .array(PairingSchema)
    .describe('An array of randomly generated pairings.'),
});

export type GeneratePairingsOutput = z.infer<
  typeof GeneratePairingsOutputSchema
>;

export async function generatePairings(
  input: GeneratePairingsInput
): Promise<GeneratePairingsOutput> {
  return generatePairingsFlow(input);
}

const generatePairingsFlow = ai.defineFlow(
  {
    name: 'generatePairingsFlow',
    inputSchema: GeneratePairingsInputSchema,
    outputSchema: GeneratePairingsOutputSchema,
  },
  async ({teams}) => {
    // Fisher-Yates shuffle for robust randomization
    for (let i = teams.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [teams[i], teams[j]] = [teams[j], teams[i]];
    }

    const pairings: [string, string][] = [];
    for (let i = 0; i < teams.length; i += 2) {
      if (teams[i + 1]) {
        pairings.push([teams[i], teams[i + 1]]);
      }
    }

    return {pairings};
  }
);
