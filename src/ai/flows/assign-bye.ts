'use server';

/**
 * @fileOverview Assigns a 'Bye' to a team when there's an odd number of teams, using AI to ensure fairness across rounds.
 *
 * - assignBye - A function that handles the assignment of a 'Bye' to a team.
 * - AssignByeInput - The input type for the assignBye function.
 * - AssignByeOutput - The return type for the assignBye function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssignByeInputSchema = z.object({
  teams: z.array(z.string()).describe('An array of team names.'),
  previousByeTeam: z
    .string()
    .optional()
    .describe('The team that received a bye in the previous round.'),
});

export type AssignByeInput = z.infer<typeof AssignByeInputSchema>;

const AssignByeOutputSchema = z.object({
  byeTeam: z.string().describe('The team that is assigned the bye.'),
  updatedTeams: z.array(z.string()).describe('The teams with bye team removed'),
});

export type AssignByeOutput = z.infer<typeof AssignByeOutputSchema>;

export async function assignBye(input: AssignByeInput): Promise<AssignByeOutput> {
  return assignByeFlow(input);
}

const assignByePrompt = ai.definePrompt({
  name: 'assignByePrompt',
  input: {schema: AssignByeInputSchema},
  output: {schema: AssignByeOutputSchema},
  prompt: `Given the following list of teams: {{teams}}, and the previous bye team was: {{previousByeTeam}}. Select a team to assign a 'Bye' to for this round.  The team selected should not be the same as the previous bye team, if possible, to ensure fairness. Respond with the name of the team assigned the bye in the byeTeam field. Exclude the bye team from the list of teams and return the updated list in the updatedTeams field.`,
});

const assignByeFlow = ai.defineFlow(
  {
    name: 'assignByeFlow',
    inputSchema: AssignByeInputSchema,
    outputSchema: AssignByeOutputSchema,
  },
  async input => {
    const {output} = await assignByePrompt(input);
    return output!;
  }
);
