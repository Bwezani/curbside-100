import { doc, setDoc, serverTimestamp, getDoc, collection, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { db } from "./firebaseClient";

export interface UserProfile {
  id?: string;
  username: string;
  email: string;
  phoneNumber: string;
  hostel: string;
  block: string;
  room: string;
  createdAt?: any;
}

// Create a new user profile in Firestore
export const createUserProfile = (userId: string, data: Omit<UserProfile, 'createdAt' | 'id'>) => {
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
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data
    } as UserProfile;
  } else {
    return null;
  }
};

// Helper to convert Firestore doc to UserProfile
const toUserProfile = (doc: QueryDocumentSnapshot<DocumentData>): UserProfile => {
  const data = doc.data();
  return {
    id: doc.id,
    username: data.username || "",
    email: data.email || "",
    phoneNumber: data.phoneNumber || "",
    hostel: data.hostel || "",
    block: data.block || "",
    room: data.room || "",
    createdAt: data.createdAt,
  };
};

// Get all user profiles from Firestore
export const getAllUsers = async (): Promise<UserProfile[]> => {
  const usersCollection = collection(db, "users");
  const userSnapshot = await getDocs(usersCollection);
  const userList = userSnapshot.docs.map(toUserProfile);
  return userList;
};