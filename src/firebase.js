// firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyD-IS4eGD72qE0sRY_qCJ1M1t3yt-7sKrA",
    authDomain: "backupticket-ffb08.firebaseapp.com",
    projectId: "backupticket-ffb08",
    storageBucket: "backupticket-ffb08.firebasestorage.app",
    messagingSenderId: "1063849745218",
    appId: "1:1063849745218:web:c597052414d4844ad086db",
    measurementId: "G-6B5QHX4RWH"
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);