
'use server';

/**
 * @fileOverview Calculates a realistic ETA for a bus to a given stop.
 * 
 * - calculateEta - A function that takes bus and route details and returns a predicted ETA.
 */

import { ai } from '@/ai/genkit';
import { CalculateEtaInput, CalculateEtaInputSchema, CalculateEtaOutput, CalculateEtaOutputSchema } from './types';


export async function calculateEta(input: CalculateEtaInput): Promise<CalculateEtaOutput> {
  return calculateEtaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateEtaPrompt',
  input: { schema: CalculateEtaInputSchema },
  output: { schema: CalculateEtaOutputSchema },
  prompt: `You are a transit logistics and traffic analysis expert for a bus tracking application. Your task is to calculate a realistic estimated time of arrival (ETA) in minutes for a bus to reach a specific destination stop.

You will be given the bus number, its current coordinates, and the name of the destination stop.

Based on this information, provide a realistic travel time in whole minutes. Assume an average city bus speed of 20 km/h and factor in the possibility of moderate traffic.

The final output must be a valid JSON object containing only the 'etaMinutes' as a whole number.

Bus: {{busNumber}}
Current Location: Lat: {{currentLocation.lat}}, Lng: {{currentLocation.lng}}
Destination Stop: {{destinationStop}}
`,
});

const calculateEtaFlow = ai.defineFlow(
  {
    name: 'calculateEtaFlow',
    inputSchema: CalculateEtaInputSchema,
    outputSchema: CalculateEtaOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
