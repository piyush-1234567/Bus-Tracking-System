'use server';
/**
 * @fileOverview Predicts the location of a bus if it hasn't sent an update in a while.
 *
 * - predictOfflineBusLocation - A function that predicts the location of an offline bus.
 * - PredictOfflineBusLocationInput - The input type for the predictOfflineBusLocation function.
 * - PredictOfflineBusLocationOutput - The return type for the predictOfflineBusLocation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ROUTES } from '@/lib/mock-data';
import type { LatLng } from '@/lib/types';


const PredictOfflineBusLocationInputSchema = z.object({
  busId: z.number().describe('The ID of the bus.'),
  lastKnownLocation: z.object({
    lat: z.number().describe('The latitude of the last known location.'),
    lng: z.number().describe('The longitude of the last known location.'),
  }).describe('The last known location of the bus.'),
  timeOfflineInSeconds: z.number().describe('The time in seconds since the last update.'),
  routeId: z.string().describe('The ID of the route the bus is on.'),
  lastPathIndex: z.number().describe('The last known path index of the bus on its route.'),
});
export type PredictOfflineBusLocationInput = z.infer<typeof PredictOfflineBusLocationInputSchema>;

const PredictOfflineBusLocationOutputSchema = z.object({
  predictedLocation: z.object({
    lat: z.number().describe('The predicted latitude of the bus.'),
    lng: z.number().describe('The predicted longitude of the bus.'),
  }).describe('The predicted location of the bus.'),
  confidence: z.number().describe('The confidence level of the prediction (0-1).'),
});
export type PredictOfflineBusLocationOutput = z.infer<typeof PredictOfflineBusLocationOutputSchema>;


export async function predictOfflineBusLocation(input: PredictOfflineBusLocationInput): Promise<PredictOfflineBusLocationOutput> {
  return predictOfflineBusLocationFlow(input);
}

const predictOfflineBusLocationFlow = ai.defineFlow(
  {
    name: 'predictOfflineBusLocationFlow',
    inputSchema: PredictOfflineBusLocationInputSchema,
    outputSchema: PredictOfflineBusLocationOutputSchema,
  },
  async (input) => {
    
    const route = ROUTES.find(r => r.id === input.routeId);
    if (!route || !route.path || route.path.length === 0) {
      // If no route, predict it stays in the same place with low confidence
      return {
        predictedLocation: input.lastKnownLocation,
        confidence: 0.1,
      };
    }

    // Average speed of a city bus in Delhi is ~15 km/h, which is ~4.17 m/s.
    const averageSpeedMs = 4.17; 
    const distanceToTravelMeters = averageSpeedMs * input.timeOfflineInSeconds;

    let distanceTraveled = 0;
    let newPathIndex = input.lastPathIndex;

    for (let i = input.lastPathIndex; i < route.path.length - 1; i++) {
        const point1 = route.path[i];
        const point2 = route.path[i + 1];
        const segmentDistance = calculateDistance(point1, point2) * 1000; // convert km to meters

        if (distanceTraveled + segmentDistance > distanceToTravelMeters) {
            // The bus is on this segment. Interpolate the position.
            const distanceNeededOnSegment = distanceToTravelMeters - distanceTraveled;
            const fraction = distanceNeededOnSegment / segmentDistance;
            const lat = point1.lat + (point2.lat - point1.lat) * fraction;
            const lng = point1.lng + (point2.lng - point1.lng) * fraction;

            return {
                predictedLocation: { lat, lng },
                // Confidence decreases as the offline time increases.
                confidence: Math.max(0.1, 1 - (input.timeOfflineInSeconds / 600)), // Confidence drops to 0.1 after 10 mins
            };
        }

        distanceTraveled += segmentDistance;
        newPathIndex = i + 1;
    }

    // If the bus traveled past the end of the route, place it at the last point.
    return {
        predictedLocation: route.path[newPathIndex],
        confidence: Math.max(0.1, 1 - (input.timeOfflineInSeconds / 600)),
    };
  }
);


// Haversine formula to calculate distance between two lat/lng points
const calculateDistance = (point1: LatLng, point2: LatLng) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (point2.lat - point1.lat) * (Math.PI / 180);
  const dLon = (point2.lng - point1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * (Math.PI / 180)) *
      Math.cos(point2.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};
