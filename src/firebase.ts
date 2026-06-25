import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer, collection, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true
}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

let isLoggingIn = false;

export const loginWithGoogle = async () => {
    if (isLoggingIn) {
        console.warn("Login is already in progress, ignoring duplicate request.");
        return;
    }
    isLoggingIn = true;
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
        if (
            error?.code === "auth/cancelled-popup-request" ||
            error?.code === "auth/popup-closed-by-user"
        ) {
            console.log("Authentication popup was cancelled or closed by user.");
        } else {
            console.error("Login Error", error);
        }
    } finally {
        isLoggingIn = false;
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout Error", error);
    }
};

// Removed testConnection to prevent startup lag / offline fetch errors
