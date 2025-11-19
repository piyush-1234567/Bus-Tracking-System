
import { doc, setDoc, updateDoc, collection, onSnapshot, Firestore } from "firebase/firestore";
import type { LatLng } from "./types";

const BUS_COLLECTION = "bus_status";

/**
 * Updates the status and location of a bus in Firestore.
 * Creates the document if it doesn't exist.
 * @param db The Firestore instance.
 * @param busId The ID of the bus (e.g., "DL5C1234").
 * @param status The status of the bus ("OPERATIONAL" or "BROKEN").
 * @param location The current latitude and longitude of the bus.
 */
export async function setBusStatus(db: Firestore, busId: string, status: "OPERATIONAL" | "BROKEN DOWN", location: LatLng) {
  if (!db) return;
  try {
    const busRef = doc(db, BUS_COLLECTION, busId);
    await setDoc(busRef, {
      status,
      location,
      lastUpdated: new Date()
    }, { merge: true }); // merge:true creates the doc if it doesn't exist, or updates it if it does.
  } catch (error) {
    console.error("Error setting bus status in Firestore: ", error);
    throw new Error("Failed to update bus status in the database.");
  }
}

/**
 * Updates only the location of a bus in Firestore.
 * This is used for frequent GPS updates.
 * @param db The Firestore instance.
 * @param busId The ID of the bus.
 * @param location The current latitude and longitude.
 */
export async function updateBusLocation(db: Firestore, busId: string, location: LatLng) {
    if (!db) return;
    try {
        const busRef = doc(db, BUS_COLLECTION, busId);
        // Using set with merge is efficient and handles creation/update seamlessly
        await setDoc(busRef, {
            location: location,
            lastUpdated: new Date()
        }, { merge: true });
    } catch(error) {
        console.error("Error updating bus location in Firestore: ", error);
        // We don't throw here as this is a frequent, non-critical update.
        // The error is logged for debugging.
    }
}


/**
 * Listens for real-time updates to all bus documents in the collection.
 * @param db The Firestore instance.
 * @param callback A function to be called with the updated bus statuses.
 * @returns An unsubscribe function to stop listening to updates.
 */
export function listenToAllBusStatuses(db: Firestore, callback: (statuses: Record<string, { status: "OPERATIONAL" | "BROKEN DOWN", location: LatLng }>) => void) {
  if (!db) return () => {};
  const busCollectionRef = collection(db, BUS_COLLECTION);
  
  const unsubscribe = onSnapshot(busCollectionRef, (snapshot) => {
    const statuses: Record<string, { status: "OPERATIONAL" | "BROKEN DOWN", location: LatLng }> = {};
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.status && data.location) {
        statuses[doc.id] = {
          status: data.status,
          location: data.location,
        };
      }
    });
    callback(statuses);
  }, (error) => {
    console.error("Error listening to bus statuses:", error);
  });

  return unsubscribe;
}
