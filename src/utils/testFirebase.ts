import { initializeFirebase, testFirebaseFeatures } from "../config/firebase";

export const runFirebaseTests = async () => {
  try {
    // Initialize Firebase
    await initializeFirebase();

    // Test both analytics and push notifications
    const testResult = await testFirebaseFeatures();
    if (testResult) {
    } else {
    }
  } catch (error) {
    console.error("Firebase test failed:", error);
  }
};
