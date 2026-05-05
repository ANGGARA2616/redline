import * as admin from 'firebase-admin';

let _adminApp: admin.app.App | null = null;

function getAdminApp(): admin.app.App {
  if (_adminApp) return _adminApp;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    // Production: decode dari environment variable
    const serviceAccount = JSON.parse(
      Buffer.from(
        process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
        'base64'
      ).toString('utf-8')
    );
    _adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // Development: baca dari file lokal
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const serviceAccount = require('../../service-account.json');
    _adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  return _adminApp;
}

export const adminApp = getAdminApp();
export const adminDb = adminApp.firestore();

/**
 * @deprecated Use adminDb directly
 */
export function getAdminDb() {
  return adminDb;
}
