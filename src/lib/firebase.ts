import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  enableNetwork,
  disableNetwork,
} from "firebase/firestore";
import { getRemoteConfig } from "firebase/remote-config";
import { setLogLevel } from "firebase/app";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCeDbAQUHkfZgXXVp_wIx5qMo154QFsqzc",
  authDomain: "safemeds-a8faf.firebaseapp.com",
  projectId: "safemeds-a8faf",
  storageBucket: "safemeds-a8faf.firebasestorage.app",
  messagingSenderId: "853443893707",
  appId: "1:853443893707:web:055d30ebe1df817c1c3e4e",
  measurementId: "G-YZ067WQHJX",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Set log level for the Firebase app (for debugging)
setLogLevel("debug"); // This is correct - it's for the Firebase app

// Initialize Remote Config
export const remoteConfig = getRemoteConfig(app);

// Configure Remote Config settings (NOT logLevel)
remoteConfig.settings = {
  minimumFetchIntervalMillis: 3600000, // 1 hour for testing, 12 hours for production
  fetchTimeoutMillis: 60000, // Optional: timeout for fetch requests
};

// Set default config values (optional)
remoteConfig.defaultConfig = {
  // Add your default remote config values here
  // example: "feature_flag": false
};

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Enable offline persistence for Firestore
// This allows the app to work offline and sync when connection is restored
if (typeof window !== "undefined") {
  // Only run in browser environment
  import("firebase/firestore").then(({ enableIndexedDbPersistence }) => {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === "failed-precondition") {
        // Multiple tabs open, persistence can only be enabled in one tab at a time
        console.warn("Firestore persistence failed: Multiple tabs open");
      } else if (err.code === "unimplemented") {
        // Browser doesn't support persistence
        console.warn("Firestore persistence not supported in this browser");
      }
    });
  });
}

// Network status management
export const enableFirestoreNetwork = async () => {
  try {
    await enableNetwork(db);
    console.log("Firestore network enabled");
  } catch (error) {
    console.error("Failed to enable Firestore network:", error);
  }
};

export const disableFirestoreNetwork = async () => {
  try {
    await disableNetwork(db);
    console.log("Firestore network disabled");
  } catch (error) {
    console.error("Failed to disable Firestore network:", error);
  }
};

export default app;
