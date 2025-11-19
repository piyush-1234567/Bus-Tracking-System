# How to Run and Deploy This Application

Follow these steps to get the "Sadda Safar" application running on your own computer and deploy it to the web.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/en) (which includes `npm`)
- [Firebase CLI](https://firebase.google.com/docs/cli#install-cli-windows)

## Step 1: Install Project Dependencies

Navigate to the project's root directory in your terminal and run the following command to install all the necessary packages listed in `package.json`:

```bash
npm install
```

## Step 2: Set Up Your Environment Variables & API Keys

This application uses third-party services for its advanced features. You will need to get API keys for them. These services offer generous free tiers, so you will not need to provide a credit card or set up billing.

### **Part A: Get Your Google AI (Gemini) API Key**

This key is **required** for all the AI-powered features in the app, like route generation and driver ETA suggestions.

1.  **Get a Gemini API Key:** Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to create your API key.
2.  **Create an Environment File:** In the root of your project, create a new file named `.env.local`.
3.  **Add the Key:** Open the `.env.local` file and add the following line, pasting your own API key after the equals sign:
    ```
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

### **Part B: Set up Firebase**

The Driver App uses Firebase Firestore to store and sync live bus locations and statuses with the public map. **These keys are required for the real-time features of the app to work.**

1.  **Create a Firebase Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Create a Web App:** Inside your new project, add a new "Web" application. Firebase will provide you with a configuration object.
3.  **Enable Firestore:** In the Firebase console menu, go to "Build" -> "Firestore Database". Click "Create database" and start in **test mode** for easy setup.
4.  **Add Keys to Environment File:** Open your `.env.local` file and add the Firebase configuration variables. Copy the values from the configuration object Firebase gave you.

    ```
    # Firebase Config
    NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
    NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
    ```

### **Part C: Get Your Twilio (SMS) API Keys**

These keys are **optional** and are only needed for the feature that sends SMS notifications to users.

1.  **Create a Free Twilio Account:** Go to the [Twilio website](https://www.twilio.com/try-twilio) and sign up.
2.  **Get a Trial Phone Number:** This is the number your app will send messages *from*.
3.  **Find Your API Keys:** On the Twilio dashboard, find your **Account SID** and **Auth Token**.
4.  **Verify Recipient Phone Number:** With a trial account, you can only send SMS to numbers you have personally verified. In the Twilio dashboard, go to **Phone Numbers -> Manage -> Verified Caller IDs** and add the phone number you want to send test messages *to*.
5.  **Add Keys to Environment File:** Open your `.env.local` file again and add the following lines.

    ```
    # Twilio Config
    TWILIO_ACCOUNT_SID=YOUR_ACCOUNT_SID_HERE
    TWILIO_AUTH_TOKEN=YOUR_AUTH_TOKEN_HERE
    TWILIO_PHONE_NUMBER=YOUR_TWILIO_PHONE_NUMBER_HERE
    TWILIO_TO_PHONE_NUMBER=THE_VERIFIED_RECIPIENT_PHONE_NUMBER_HERE
    ```
    _Ensure the recipient number is in E.164 format, e.g., `+911234567890`._

After this step, your `.env.local` file will contain all the keys needed to run the application's features.

## Step 3: Run the Development Servers (Local Only)

You need to run **two servers simultaneously** in two separate terminal windows for the app to be fully functional on your local machine.

**Terminal 1: Start the Web Application**
In your first terminal, run this command to start the Next.js frontend:
```bash
npm run dev
```
This will make the website available at `http://localhost:9002`. This server handles everything you see and click on.

**Terminal 2: Start the AI Service**
In a second terminal, run this command to start the Genkit AI service:
```bash
npm run genkit:dev
```
This server runs in the background and allows the web application to communicate with the AI models for features like route generation. You must keep this terminal running alongside the first one.

## Step 4: Deploying Your Application (To Get a Shareable URL)

When you want to share your application with others, you need to deploy it to Firebase. This will give you a public URL.

1.  **Login to Firebase:**
    Open your terminal and run:
    ```bash
    firebase login
    ```
    This will open a browser window for you to log in to your Google account.

2.  **Initialize Firebase App Hosting:**
    In your project's root directory, run the following command:
    ```bash
    firebase apphosting:backends:create
    ```
    Follow the on-screen prompts. It will ask you to select a Firebase project and choose a location.

3.  **Deploy the Application:**
    Once the backend is created, deploy your application with this command:
    ```bash
    firebase apphosting:deploy
    ```
    The command will build your Next.js application and upload it to Firebase. When it's finished, it will give you a public **URL** (like `https://your-project-name--your-backend-name.web.app`).

**This final URL is the one you can share with anyone, and they will be able to see and use your live website!**
