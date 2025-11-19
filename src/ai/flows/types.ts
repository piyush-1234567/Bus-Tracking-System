
import { z } from 'genkit';

export const LatLngSchema = z.object({
    lat: z.number().describe('The latitude.'),
    lng: z.number().describe('The longitude.'),
});

export const GenerateRoutePathInputSchema = z.object({
  waypoints: z.array(z.union([LatLngSchema, z.string()])).describe('An ordered list of coordinates or location names that the route must pass through.'),
});
export type GenerateRoutePathInput = z.infer<typeof GenerateRoutePathInputSchema>;

export const GenerateRoutePathOutputSchema = z.object({
  path: z.array(LatLngSchema).describe('A detailed, ordered list of coordinates representing the street-level path.'),
});
export type GenerateRoutePathOutput = z.infer<typeof GenerateRoutePathOutputSchema>;


export const GenerateWalkingPathInputSchema = z.object({
  start: LatLngSchema.describe('The starting coordinate.'),
  end: LatLngSchema.describe('The ending coordinate.'),
});
export type GenerateWalkingPathInput = z.infer<typeof GenerateWalkingPathInputSchema>;

export const GenerateWalkingPathOutputSchema = z.object({
  path: z.array(LatLngSchema).describe('A detailed, ordered list of coordinates representing the walking path.'),
});
export type GenerateWalkingPathOutput = z.infer<typeof GenerateWalkingPathOutputSchema>;
