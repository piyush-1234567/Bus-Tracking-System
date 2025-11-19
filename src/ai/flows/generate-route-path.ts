
'use server';

/**
 * @fileOverview Generates a detailed, street-level route path from a series of waypoints.
 * 
 * - generateRoutePath - A function that takes a list of coordinates or location names and returns a detailed path.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { LatLngSchema, GenerateRoutePathOutput, GenerateRoutePathOutputSchema } from '@/ai/flows/types';

// Allow waypoints to be either coordinates or strings
const GenerateRoutePathInputSchema = z.object({
  waypoints: z.array(z.union([LatLngSchema, z.string()])).describe('An ordered list of coordinates or location names (e.g., "Red Fort, Delhi") that the route must pass through.'),
});
export type GenerateRoutePathInput = z.infer<typeof GenerateRoutePathInputSchema>;


export async function generateRoutePath(input: GenerateRoutePathInput): Promise<GenerateRoutePathOutput> {
  return generateRoutePathFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRoutePathPrompt',
  input: { schema: GenerateRoutePathInputSchema },
  output: { schema: GenerateRoutePathOutputSchema },
  prompt: `You are a virtual routing engine for a bus tracking application. Your task is to generate a detailed, realistic, street-level path between a given series of waypoints.

First, you must geocode any waypoints that are provided as text strings into precise latitude and longitude coordinates. Then, generate the bus route.

The path you generate must strictly follow actual roads, highways, and streets that a bus can travel on. Do not cut across buildings, parks, or other non-navigable areas.

The output must be a valid JSON object that conforms to the output schema. Generate a list of at least 50 coordinates that smoothly represents the turns and curves of the road network for the entire path. The response MUST be only the JSON object, without any markdown formatting.

The route starts at the first waypoint, passes through all subsequent waypoints in order, and ends at the last waypoint.

Waypoints:
{{#each waypoints}}
- {{#if this.lat}}Lat: {{lat}}, Lng: {{lng}}{{else}}{{this}}{{/if}}
{{/each}}
`,
});

const generateRoutePathFlow = ai.defineFlow(
  {
    name: 'generateRoutePathFlow',
    inputSchema: GenerateRoutePathInputSchema,
    outputSchema: GenerateRoutePathOutputSchema,
  },
  async (input) => {
    // In a real application, you might call a routing service like OSRM or Google Maps Directions API.
    // Here, we use an LLM to simulate that call and generate a plausible route.
    const { output } = await prompt(input);
    return output!;
  }
);
