import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

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

let persistence;
if (Platform.OS === "web") {
  persistence = undefined; // Para web, use a persistência padrão
} else {
  persistence = getReactNativePersistence(ReactNativeAsyncStorage);
}

const auth = initializeAuth(app, {
  persistence,
});

const db = getFirestore(app);

export { auth, db };
