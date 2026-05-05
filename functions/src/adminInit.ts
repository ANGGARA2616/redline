import * as admin from "firebase-admin";

// Initialize once — in Firebase Functions, credentials are auto-detected.
if (admin.apps.length === 0) {
  admin.initializeApp();
}

export const db = admin.firestore();
export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;
