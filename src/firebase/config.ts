
// This file is not intended to be edited.
// It is used to deploy and configure Firebase services.
// To configure your Firebase project, edit the service-account.json file.
import { FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app';

const firebaseConfig: FirebaseOptions = {
  apiKey: "REDACTED",
  authDomain: "tijuana-shop.firebaseapp.com",
  projectId: "tijuana-shop",
  storageBucket: "tijuana-shop.appspot.com",
  messagingSenderId: "923422739335",
  appId: "1:923422739335:web:2a823c316c8f58b7a6953f"
};


// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export { app };
export { firebaseConfig };
