
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {defineFlow, run, flow} from 'genkit/flow';
import {z} from 'zod';
import {configure} from '@genkit-ai/next';

// Import public flows so that they are registered
import {predictOfflineBusLocation} from '@/ai/flows/predict-offline-bus-location';
import {generateRoutePath} from '@/ai/flows/generate-route-path';
import {generateWalkingPath} from '@/ai/flows/generate-walking-path';
import {findBusRoute} from '@/ai/flows/find-bus-route';
import {sendSmsNotification} from '@/ai/flows/send-sms-notification';

// Import driver flows
import { dynamicEtaUpload } from '@/ai/flows/driver/dynamicEtaUpload';


export const {GET, POST} = configure({
  plugins: [googleAI()],
  flows: [
      // Public flows
      predictOfflineBusLocation,
      generateRoutePath,
      generateWalkingPath,
      findBusRoute,
      sendSmsNotification,
      // Driver flows
      dynamicEtaUpload,
  ],
  dev: {
    cors: {
      origin: '*',
    },
  },
});
