// This file is intentionally designed to prevent Firebase initialization
// if it was not manually deleted after a feature revert.
// It ensures that isFirebaseConfigValid is false and no Firebase app is initialized.

export const app = null;
export const auth = null;
export const db = null;

// Force isFirebaseConfigValid to false to ensure auth is bypassed
// in any context that might still be using this file.
export const isFirebaseConfigValid = false;

// console.log("Safe firebase.ts loaded: Firebase initialization explicitly bypassed.");
