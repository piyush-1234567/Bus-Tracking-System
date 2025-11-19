
'use server';
/**
 * @fileOverview Sends an SMS notification using Twilio.
 * 
 * - sendSmsNotification - A function that sends an SMS with bus location data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { LatLngSchema } from './types';
import twilio from 'twilio';

const SendSmsNotificationInputSchema = z.object({
  busNumber: z.string().describe("The number of the bus."),
  location: LatLngSchema.describe("The current location of the bus."),
  toPhoneNumber: z.string().describe("The recipient's phone number."),
  stopName: z.string().describe("The name of the current or last known bus stop."),
});
export type SendSmsNotificationInput = z.infer<typeof SendSmsNotificationInputSchema>;

const SendSmsNotificationOutputSchema = z.object({
  status: z.string().describe("The status of the SMS message (e.g., 'queued', 'sent')."),
  sid: z.string().describe("The Twilio message SID."),
});
export type SendSmsNotificationOutput = z.infer<typeof SendSmsNotificationOutputSchema>;


export async function sendSmsNotification(input: SendSmsNotificationInput): Promise<SendSmsNotificationOutput> {
  return sendSmsNotificationFlow(input);
}


const sendSmsNotificationFlow = ai.defineFlow(
  {
    name: 'sendSmsNotificationFlow',
    inputSchema: SendSmsNotificationInputSchema,
    outputSchema: SendSmsNotificationOutputSchema,
  },
  async (input) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromPhoneNumber) {
        throw new Error("Twilio credentials are not configured in the environment variables.");
    }

    const client = twilio(accountSid, authToken);

    const messageBody = `Sadda Safar Alert: Bus ${input.busNumber} is in a low network zone. Last seen near ${input.stopName}. Location: https://www.google.com/maps?q=${input.location.lat},${input.location.lng}`;

    try {
        const message = await client.messages.create({
            body: messageBody,
            from: fromPhoneNumber,
            to: input.toPhoneNumber
        });

        return {
            status: `Message sent successfully to ${input.toPhoneNumber}.`,
            sid: message.sid
        };
    } catch (error: any) {
        console.error("Twilio API Error:", error);
        // Provide a more user-friendly error message
        if (error.code === 21211) { // Invalid 'To' Phone Number
             throw new Error(`The recipient phone number (${input.toPhoneNumber}) is not a valid or verified number in your Twilio account.`);
        }
        throw new Error(`Failed to send SMS via Twilio: ${error.message}`);
    }
  }
);
