import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app';

export function customInitApp() {
  if (getApps().length <= 0) {
    initializeApp({
      credential: applicationDefault(),
    });
  }
}
