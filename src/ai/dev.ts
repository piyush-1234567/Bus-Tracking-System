
import { config } from 'dotenv';
// Explicitly load the .env.local file
config({ path: '.env.local' });

// Public facing flows
import '@/ai/flows/predict-offline-bus-location.ts';
import '@/ai/flows/generate-route-path';
import '@/ai/flows/generate-walking-path';
import '@/ai/flows/find-bus-route';
import '@/ai/flows/send-sms-notification';
import '@/ai/flows/calculate-eta';


// Driver app flows
import '@/ai/flows/driver/dynamicEtaUpload';
import '@/ai/flows/driver/reportBusStatus';
