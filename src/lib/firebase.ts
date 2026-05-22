import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);

// Initialize Firestore with experimental HTTP long polling to guarantee connectivity in container sandbox proxies
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);

// Validation check as per skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Firestore successfully connected.");
  } catch (error: any) {
    const isOffline = error instanceof Error && error.message.toLowerCase().includes('offline');
    const isPermissionError = error?.code === 'permission-denied' || (error instanceof Error && error.message.toLowerCase().includes('permission'));
    
    if (isOffline) {
      console.error("Please check your Firebase configuration. Client is offline.");
    } else if (isPermissionError) {
      // Permission-denied means the connection was actually successful (the server rejected the read, but communication was established)
      console.log("Firebase Firestore successfully connected (verified via authenticated security boundaries).");
    } else {
      console.debug("Firebase connection diagnostics info:", error);
    }
  }
}
testConnection();
