
'use server';
/**
 * @fileOverview Analyzes traffic and weather to suggest ETA updates for drivers.
 *
 * - dynamicEtaUpload - A function that suggests if an ETA update is needed.
 * - DynamicEtaUploadInput - The input type for the function.
 * - DynamicEtaUploadOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { LatLngSchema } from '@/ai/flows/types';
import { DynamicEtaUploadInputSchema, DynamicEtaUploadOutputSchema, type DynamicEtaUploadInput, type DynamicEtaUploadOutput } from './types';


// Mock Tool to get weather data
const getWeatherData = ai.defineTool(
    {
        name: 'getWeatherData',
        description: 'Gets the current weather conditions for a given location.',
        inputSchema: LatLngSchema,
        outputSchema: z.object({
            condition: z.enum(["Clear", "Rainy", "Foggy", "Stormy"]),
            temperature: z.number().describe("Temperature in Celsius."),
        }),
    },
    async (location) => {
        // In a real app, this would call a weather API.
        // For now, we simulate it.
        const conditions: ("Clear" | "Rainy" | "Foggy" | "Stormy")[] = ["Clear", "Rainy", "Foggy"];
        const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
        return {
            condition: randomCondition,
            temperature: Math.floor(Math.random() * 15) + 20, // Temp between 20-35 C
        };
    }
);


// Mock Tool to get traffic data
const getTrafficData = ai.defineTool(
    {
        name: 'getTrafficData',
        description: 'Gets the current traffic congestion level for a given location.',
        inputSchema: LatLngSchema,
        outputSchema: z.object({
            congestion: z.enum(["Light", "Moderate", "Heavy"]),
        }),
    },
    async (location) => {
        // In a real app, this would call a service like Google Maps API.
        // For now, we simulate it.
        const levels: ("Light" | "Moderate" | "Heavy")[] = ["Light", "Moderate", "Heavy"];
        const randomLevel = levels[Math.floor(Math.random() * levels.length)];
        return {
            congestion: randomLevel,
        };
    }
);

const prompt = ai.definePrompt({
    name: 'etaSuggestionPrompt',
    input: { schema: DynamicEtaUploadInputSchema },
    output: { schema: DynamicEtaUploadOutputSchema },
    tools: [getWeatherData, getTrafficData],
    prompt: `You are an expert transit logistics AI for the "Safar Saathi" driver app.
Your job is to analyze real-time data and suggest if a bus driver needs to update their ETA.

The driver's current ETA is {{currentEtaMinutes}} minutes.

Use the available tools to get current weather and traffic conditions for the bus's location.

- If traffic is 'Heavy' or weather is 'Rainy' or 'Foggy', the ETA is likely underestimated. Add 5-10 minutes to the current ETA.
- If traffic is 'Light' and weather is 'Clear', the ETA might be overestimated. Subtract 2-5 minutes from the current ETA.
- If conditions are moderate, the current ETA is likely accurate.

Based on your analysis, decide if an update is needed. Provide a clear reason for your suggestion.
If no update is needed, set shouldUpdate to false and newEtaMinutes to 0.
The new ETA must be a positive number.
`,
});


const dynamicEtaUploadFlow = ai.defineFlow(
  {
    name: 'dynamicEtaUploadFlow',
    inputSchema: DynamicEtaUploadInputSchema,
    outputSchema: DynamicEtaUploadOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("The AI model did not return a valid suggestion.");
    }
    return output;
  }
);


export async function dynamicEtaUpload(input: DynamicEtaUploadInput): Promise<DynamicEtaUploadOutput> {
  return dynamicEtaUploadFlow(input);
}
