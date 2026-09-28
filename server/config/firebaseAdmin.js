import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

const isConfigured = Boolean(projectId && clientEmail && privateKey);

if (isConfigured && !getApps().length) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
} else if (!isConfigured) {
  console.warn(
    "Firebase Admin not configured — set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY. Auth-protected routes will reject all requests until this is set."
  );
}

export { isConfigured };
export const auth = () => getAuth();
