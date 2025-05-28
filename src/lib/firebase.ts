
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

// Check if the essential API key and Project ID are present and non-empty.
export const isFirebaseConfigValid = 
  !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "" &&
  !!firebaseConfig.projectId && firebaseConfig.projectId !== "";

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
    "Firebase configuration is missing or invalid. Authentication will be bypassed. " +
    "Please check your .env file. To enable Firebase authentication, ensure " +
    "NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID are set correctly. " +
    "Other NEXT_PUBLIC_FIREBASE_* variables might also be needed depending on Firebase services used."
  );
  // app and auth will remain undefined, and the app will bypass auth.
}

export { app, auth };

