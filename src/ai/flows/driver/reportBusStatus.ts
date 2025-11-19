
'use server';
/**
 * @fileOverview Flow to report a bus's status to Firestore.
 *
 * - reportBusStatus - A function that updates the bus status in the database.
 */
import { initializeFirebase } from '@/firebase';
import { setBusStatus as setBusStatusInDb } from '@/lib/firebase';
import type { ReportBusStatusInput } from './types';

/**
 * Updates the bus status in Firestore. This is a server action that can be called from client components.
 * @param input - The bus ID, new status, and location.
 * @returns An object indicating success or failure.
 */
export async function reportBusStatus(input: ReportBusStatusInput) {
  try {
    const { db } = initializeFirebase();
    if (!db) {
        throw new Error("Firebase is not initialized.");
    }
    await setBusStatusInDb(db, input.busId, input.status, input.location);
    return {
      success: true,
      message: `Successfully reported status for bus ${input.busId} as ${input.status}.`,
    };
  } catch (error: any) {
    console.error("Error in reportBusStatus action:", error);
    // Return a serializable error object for the client
    return {
      success: false,
      message: `Failed to update status in Firestore: ${error.message}`
    };
  }
}
