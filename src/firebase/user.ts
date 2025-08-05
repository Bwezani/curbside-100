import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "./firebaseClient";

export interface UserProfile {
  username: string;
  email: string;
  phoneNumber: string;
  hostel: string;
  block: string;
  room: string;
  createdAt?: any;
}

// Create a new user profile in Firestore
export const createUserProfile = (userId: string, data: Omit<UserProfile, 'createdAt'>) => {
  const userRef = doc(db, "users", userId);
  return setDoc(userRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
};

// Get a user profile from Firestore
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, "users", userId);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  } else {
    return null;
  }
};
