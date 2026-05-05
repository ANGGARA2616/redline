import * as admin from 'firebase-admin';

let _adminApp: admin.app.App | undefined;

function getAdminApp(): admin.app.App {
  if (_adminApp) return _adminApp;

  if (admin.apps.length > 0) {
    _adminApp = admin.apps[0]!;
    return _adminApp;
  }

  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (base64) {
    // Production (Vercel)
    const serviceAccount = JSON.parse(
      Buffer.from(base64, 'base64').toString('utf-8')
    );
    _adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  } else {
    // Development (local) - gunakan eval untuk hindari 
    // Turbopack static analysis
    const path = '../../service-account.json';
    // eslint-disable-next-line no-eval
    const serviceAccount = eval('require')(path);
    _adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  return _adminApp;
}

export const adminApp = getAdminApp();
export const adminDb = adminApp.firestore();
