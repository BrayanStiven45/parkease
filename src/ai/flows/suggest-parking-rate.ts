// A parking rate suggestion AI agent.
//
//  - suggestParkingRate - A function that suggests a parking rate.
//  - SuggestParkingRateInput - The input type for the suggestParkingRate function.
//  - SuggestParkingRateOutput - The return type for the suggestParkingRate function.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestParkingRateInputSchema = z.object({
  entryTime: z.string().describe('The entry time of the vehicle as an ISO string.'),
  durationHours: z
    .number()
    .describe('The duration of parking in hours, can be a decimal.'),
  historicalData: z
    .string()
    .describe(
      'Historical parking data, including dates, times, durations, and prices.'
    ),
});
export type SuggestParkingRateInput = z.infer<typeof SuggestParkingRateInputSchema>;

const SuggestParkingRateOutputSchema = z.object({
  suggestedRate: z
    .number()
    .describe('The suggested parking rate based on the input data.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the suggested rate, explaining the factors considered.'),
});
export type SuggestParkingRateOutput = z.infer<typeof SuggestParkingRateOutputSchema>;

export async function suggestParkingRate(input: SuggestParkingRateInput): Promise<SuggestParkingRateOutput> {
  return suggestParkingRateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestParkingRatePrompt',
  input: {schema: SuggestParkingRateInputSchema},
  output: {schema: SuggestParkingRateOutputSchema},
  prompt: `You are an expert parking rate strategist. You analyze parking data and suggest optimal rates. 

  Consider the entry time, duration, and historical data to suggest a rate that maximizes revenue while efficiently managing parking space demand. 

  Entry Time: {{{entryTime}}}
  Duration (Hours): {{{durationHours}}}
  Historical Data: {{{historicalData}}}

  Provide the suggested rate and a brief explanation of your reasoning.

  Ensure the suggestedRate field is a number.
  `,
});

const suggestParkingRateFlow = ai.defineFlow(
  {
    name: 'suggestParkingRateFlow',
    inputSchema: SuggestParkingRateInputSchema,
    outputSchema: SuggestParkingRateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
