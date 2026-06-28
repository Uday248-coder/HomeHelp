import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

function getServiceAccount(): admin.ServiceAccount {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  }
  const filePath = path.resolve(__dirname, '../../firebase-service-account.json');
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  throw new Error(
    'FIREBASE_SERVICE_ACCOUNT_KEY env var not set and firebase-service-account.json not found',
  );
}

function initFirebase(): admin.app.App {
  if (admin.apps.length) return admin.apps[0]!;
  const serviceAccount = getServiceAccount();
  return admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

export const firebaseApp = initFirebase();
export const firebaseAuth = admin.auth(firebaseApp);
