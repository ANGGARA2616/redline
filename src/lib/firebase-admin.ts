import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import path from "path";

/**
 * Firebase Admin SDK — for server-side API routes.
 *
 * Uses service account credentials to bypass Firestore security rules.
 * The service account JSON should be placed at the project root as
 * `service-account.json` (excluded from git via .gitignore).
 *
 * Alternatively, set GOOGLE_APPLICATION_CREDENTIALS env var.
 */

let _adminApp: App | null = null;
let _adminDb: Firestore | null = null;

function getAdminApp(): App {
  if (_adminApp) return _adminApp;
  if (getApps().length > 0) {
    _adminApp = getApps()[0];
    return _adminApp;
  }

  // Try service-account.json at project root
  const serviceAccountPath = path.join(process.cwd(), "service-account.json");

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const serviceAccount = require(serviceAccountPath);
    _adminApp = initializeApp({
      credential: cert(serviceAccount),
    });
  } catch {
    // Fallback: use GOOGLE_APPLICATION_CREDENTIALS env var
    // or Application Default Credentials (e.g. on GCP)
    _adminApp = initializeApp();
  }

  return _adminApp;
}

export function getAdminDb(): Firestore {
  if (!_adminDb) {
    _adminDb = getFirestore(getAdminApp());
  }
  return _adminDb;
}
