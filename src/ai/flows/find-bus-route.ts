
'use server';

/**
 * @fileOverview Finds a bus route between two text-based locations.
 * 
 * - findBusRoute - A function that takes a start and end location string and returns a route path.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { LatLngSchema } from '@/ai/flows/types';
import { generateRoutePath } from './generate-route-path';
import { ROUTES } from '@/lib/mock-data';

const FindBusRouteInputSchema = z.object({
  start: z.string().describe("The starting location or address."),
  end: z.string().describe("The ending location or address."),
});
export type FindBusRouteInput = z.infer<typeof FindBusRouteInputSchema>;

const FindBusRouteOutputSchema = z.object({
  path: z.array(LatLngSchema).describe('A detailed, ordered list of coordinates representing the bus route path.'),
  routeName: z.string().describe("The name of the recommended bus route."),
  startCoords: LatLngSchema,
  endCoords: LatLngSchema,
});
export type FindBusRouteOutput = z.infer<typeof FindBusRouteOutputSchema>;


export async function findBusRoute(input: FindBusRouteInput): Promise<FindBusRouteOutput> {
  return findBusRouteFlow(input);
}


const findBusRouteFlow = ai.defineFlow(
  {
    name: 'findBusRouteFlow',
    inputSchema: FindBusRouteInputSchema,
    outputSchema: FindBusRouteOutputSchema,
  },
  async (input) => {
    
    // First, try to find a matching predefined route.
    const lowerCaseStart = input.start.toLowerCase();
    const lowerCaseEnd = input.end.toLowerCase();

    for (const route of ROUTES) {
        const waypoints = route.waypoints || [];
        // Only check routes that actually have named waypoints
        const namedWaypoints = waypoints.filter(wp => !!wp.name);

        if (namedWaypoints.length > 0) {
            const startIndex = namedWaypoints.findIndex(wp => wp.name!.toLowerCase() === lowerCaseStart);
            const endIndex = namedWaypoints.findIndex(wp => wp.name!.toLowerCase() === lowerCaseEnd);

            if (startIndex !== -1 && endIndex !== -1 && startIndex !== endIndex) {
                // Found a matching predefined route!
                const startCoords = namedWaypoints[startIndex];
                const endCoords = namedWaypoints[endIndex];
                
                // For simplicity, we return the whole route path if both points are on it.
                // A more advanced implementation would slice the path array.
                return {
                    path: route.path,
                    routeName: route.name,
                    startCoords: { lat: startCoords.lat, lng: startCoords.lng },
                    endCoords: { lat: endCoords.lat, lng: endCoords.lng },
                };
            }
        }
    }
    
    // If no predefined route is found, fall back to the AI generation.
    const pathResponse = await generateRoutePath({ waypoints: [input.start, input.end] });
    
    if (!pathResponse || pathResponse.path.length === 0) {
        throw new Error(`Could not generate a route between ${input.start} and ${input.end}.`);
    }

    const startCoords = pathResponse.path[0];
    const endCoords = pathResponse.path[pathResponse.path.length - 1];

    return {
        path: pathResponse.path,
        routeName: `Route from ${input.start} to ${input.end}`,
        startCoords: startCoords,
        endCoords: endCoords,
    };
  }
);

