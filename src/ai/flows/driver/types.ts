import { z } from 'genkit';
import { LatLngSchema } from '@/ai/flows/types';

export const ReportBusStatusInputSchema = z.object({
  busId: z.string().describe("The unique identifier for the bus (e.g., its license plate)."),
  status: z.enum(["OPERATIONAL", "BROKEN DOWN"]).describe("The current status of the vehicle."),
  location: LatLngSchema.describe("The current GPS coordinates of the bus when the status is reported."),
});
export type ReportBusStatusInput = z.infer<typeof ReportBusStatusInputSchema>;

export const ReportBusStatusOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type ReportBusStatusOutput = z.infer<typeof ReportBusStatusOutputSchema>;


export const DynamicEtaUploadInputSchema = z.object({
  currentEtaMinutes: z.number().describe('The current estimated time of arrival in minutes.'),
  location: LatLngSchema.describe('The current location of the bus.'),
});
export type DynamicEtaUploadInput = z.infer<typeof DynamicEtaUploadInputSchema>;

export const DynamicEtaUploadOutputSchema = z.object({
  shouldUpdate: z.boolean().describe('Whether the driver should update the ETA.'),
  reason: z.string().describe('A brief explanation for the suggestion.'),
  newEtaMinutes: z.number().describe('The newly suggested ETA in minutes. 0 if no update is needed.'),
});
export type DynamicEtaUploadOutput = z.infer<typeof DynamicEtaUploadOutputSchema>;
