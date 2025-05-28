
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if the essential API key is present.
export const isFirebaseConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

if (isFirebaseConfigValid) {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0]; // Use the already initialized app
  }
  auth = getAuth(app);
} else {
  console.error(
    "Firebase configuration is missing or invalid. " +
    "Please check your .env file and ensure all NEXT_PUBLIC_FIREBASE_* variables are set correctly. " +
    "Specifically, NEXT_PUBLIC_FIREBASE_API_KEY is crucial."
  );
  // app and auth will remain undefined
}

export { app, auth };
