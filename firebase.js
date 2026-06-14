import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDAIrRQcwje_z0caQj-RDLnFgP_J0jhaQk",
  authDomain: "moghomes.firebaseapp.com",
  projectId: "moghomes",
  storageBucket: "moghomes.firebasestorage.app",
  messagingSenderId: "595137253542",
  appId: "1:595137253542:android:539cc32e2b74800c68a467"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
