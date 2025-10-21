import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBEbCUl1uod-hnohMCGsCqtjhjsPcBiFbE",
  authDomain: "wecharity-9b9cf.firebaseapp.com",
  projectId: "wecharity-9b9cf",
  storageBucket: "wecharity-9b9cf.firebasestorage.app",
  messagingSenderId: "892199314758",
  appId: "1:892199314758:web:89473efffdc50a5022f147",
  measurementId: "G-C85GX468LR"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getFirestore(app);

export { auth, db };
