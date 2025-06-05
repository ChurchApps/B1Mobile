import { initializeFirebase, testFirebaseFeatures } from "../config/firebase";

export const runFirebaseTests = async () => {
  try {
    // Initialize Firebase
    await initializeFirebase();
    console.log("Firebase initialized");

    // Test both analytics and push notifications
    const testResult = await testFirebaseFeatures();
    if (testResult) {
      console.log("✅ All Firebase features are working correctly");
    } else {
      console.log("❌ Some Firebase features are not working correctly");
    }
  } catch (error) {
    console.error("Firebase test failed:", error);
  }
};
