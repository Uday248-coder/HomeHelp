import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyARrlLoEYiVhJoBTVMMpGPO8mJzTpGhRUI",
  authDomain: "homehelp-cdb69.firebaseapp.com",
  projectId: "homehelp-cdb69",
  storageBucket: "homehelp-cdb69.firebasestorage.app",
  messagingSenderId: "379706110298",
  appId: "1:379706110298:web:8c0b7e2d9469122e9e0363"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
