import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import type { UserCredential } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB6lB9V3e4d7f2g1h0j9k8l7m6n5o4p3q2",
  authDomain: "homehelp-cdb69.firebaseapp.com",
  projectId: "homehelp-cdb69",
  storageBucket: "homehelp-cdb69.firebasestorage.app",
  messagingSenderId: "379706110298",
  appId: "1:379706110298:web:8c0b7e2d9469122e9e0363"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export interface AuthResult {
  success: boolean;
  verificationId?: string;
  error?: string;
  userCredential?: UserCredential;
}

export async function sendPhoneOTP(phoneNumber: string): Promise<AuthResult> {
  try {
    // Format phone number for India
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber.replace(/\D/g, '')}`;
    
    // Create invisible reCAPTCHA verifier
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
    });
    
    const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    
    return {
      success: true,
      verificationId: confirmation.verificationId,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to send OTP';
    return { success: false, error: msg };
  }
}

export async function verifyPhoneOTP(verificationId: string, otp: string): Promise<AuthResult> {
  try {
    const credential = PhoneAuthProvider.credential(verificationId, otp);
    const userCredential = await signInWithCredential(auth, credential);
    return { success: true, userCredential };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Invalid OTP';
    return { success: false, error: msg };
  }
}

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export function onAuthStateChanged(callback: (user: unknown) => void) {
  return auth.onAuthStateChanged(callback);
}

export function signOut() {
  return auth.signOut();
}