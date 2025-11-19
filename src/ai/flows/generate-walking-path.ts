
'use server';

/**
 * @fileOverview Generates a detailed, street-level walking path between two points.
 *
 * - generateWalkingPath - A function that takes a start and end coordinate and returns a detailed path.
 */

import { ai } from '@/ai/genkit';
import { GenerateWalkingPathInput, GenerateWalkingPathInputSchema, GenerateWalkingPathOutput, GenerateWalkingPathOutputSchema } from '@/ai/flows/types';

export async function generateWalkingPath(input: GenerateWalkingPathInput): Promise<GenerateWalkingPathOutput> {
  return generateWalkingPathFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWalkingPathPrompt',
  input: { schema: GenerateWalkingPathInputSchema },
  output: { schema: GenerateWalkingPathOutputSchema },
  prompt: `You are a virtual routing engine for a transit application. Your task is to generate a detailed, realistic, street-level walking path between a start and end point.

The path you generate must strictly follow actual roads, streets, and pedestrian-friendly pathways. Do not cut across buildings, private property, or other non-navigable areas.

The output must be a valid JSON object that conforms to the output schema. Generate a list of at least 20 coordinates that smoothly represents the turns and curves of the walkable path. The response MUST be only the JSON object, without any markdown formatting.

Start: Lat: {{start.lat}}, Lng: {{start.lng}}
End: Lat: {{end.lat}}, Lng: {{end.lng}}
`,
});

const generateWalkingPathFlow = ai.defineFlow(
  {
    name: 'generateWalkingPathFlow',
    inputSchema: GenerateWalkingPathInputSchema,
    outputSchema: GenerateWalkingPathOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
