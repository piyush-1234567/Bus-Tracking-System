
import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { FirebaseApp } from "firebase/app";

// These are client-side hooks, so we need to re-export them from a client component barrel file
export { useUser } from "./auth/use-user";
export {
  useAuth,
  useFirebaseApp,
  useFirestore,
} from "./provider";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

type FirebaseInstances = {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
}

// Store initialized instances to avoid re-initialization
let firebaseInstances: FirebaseInstances | null = null;


export function initializeFirebase(): FirebaseInstances {
  // If we've already initialized, return the existing instances
  if (firebaseInstances) {
    return firebaseInstances;
  }
  
  // Check if the necessary environment variables are set.
  // If not, we'll return null for the instances, and dependent features will be disabled.
  if (!firebaseConfig.apiKey) {
    console.warn("Firebase API Key is missing. Firebase features will be disabled.");
    firebaseInstances = { app: null, auth: null, db: null };
    return firebaseInstances;
  }

  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const auth = getAuth(app);
    const db = getFirestore(app);

    firebaseInstances = { app, auth, db };
    return firebaseInstances;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    firebaseInstances = { app: null, auth: null, db: null };
    return firebaseInstances;
  }
}
