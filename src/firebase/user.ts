
import { doc, setDoc, serverTimestamp, getDoc, collection, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { db } from "./firebaseClient";

export interface UserProfile {
  id?: string;
  username: string; // Keep for display name compatibility
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userType: 'student' | 'non-student';
  university?: string;
  hostel?: string;
  block?: string;
  room?: string;
  address?: string;
  landmark?: string;
  township?: string;
  city?: string;
  latitude?: number | null;
  longitude?: number | null;
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
    username: data.username || `${data.firstName} ${data.lastName}` || "",
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    email: data.email || "",
    phoneNumber: data.phoneNumber || "",
    userType: data.userType || 'student', // Default to student for backward compatibility
    university: data.university || "",
    hostel: data.hostel || "",
    block: data.block || "",
    room: data.room || "",
    address: data.address || "",
    createdAt: data.createdAt,
    landmark: data.landmark || '',
    township: data.township || '',
    city: data.city || 'Lusaka',
    latitude: data.latitude || null,
    longitude: data.longitude || null,
  };
};

// Get all user profiles from Firestore
export const getAllUsers = async (): Promise<UserProfile[]> => {
  const usersCollection = collection(db, "users");
  const userSnapshot = await getDocs(usersCollection);
  const userList = userSnapshot.docs.map(toUserProfile);
  return userList;
};

    