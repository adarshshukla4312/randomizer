'use server';

/**
 * @fileOverview Creates random pairings from a list of teams using a generative model.
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

const generatePairingsPrompt = ai.definePrompt({
  name: 'generatePairingsPrompt',
  input: {schema: GeneratePairingsInputSchema},
  output: {schema: GeneratePairingsOutputSchema},
  prompt: `From the provided list of teams ({{teams}}), create random pairings. Ensure that the pairings are completely random and avoid any discernible patterns. Each team should appear in only one pairing.`,
});

const generatePairingsFlow = ai.defineFlow(
  {
    name: 'generatePairingsFlow',
    inputSchema: GeneratePairingsInputSchema,
    outputSchema: GeneratePairingsOutputSchema,
  },
  async input => {
    const {output} = await generatePairingsPrompt(input);
    return output!;
  }
);
