import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCEJ6_JGI_nhKKEMYRzDg6KExi2InyxJyQ",
    authDomain: "wemeetapp-c03af.firebaseapp.com",
    projectId: "wemeetapp-c03af",
    storageBucket: "wemeetapp-c03af.firebasestorage.app",
    messagingSenderId: "904367816453",
    appId: "1:904367816453:web:04ba26d21f21379fa6c16c",
    measurementId: "G-RG80YNFZTR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;