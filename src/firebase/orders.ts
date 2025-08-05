
import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { db } from "./firebaseClient";

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  createdAt: any;
  totalPrice: number;
  status: "in progress" | "completed" | "cancelled";
  items: OrderItem[];
  username: string;
  phoneNumber: string;
  hostel: string;
}

export interface OrderData {
  totalPrice: number;
  items: Omit<OrderItem, 'id'>[];
  username: string;
  phoneNumber: string;
  hostel: string;
}

// Create a new order in Firestore
export const createOrder = async (userId: string, data: OrderData): Promise<string> => {
  const ordersCollection = collection(db, "orders");
  const docRef = await addDoc(ordersCollection, {
    userId,
    ...data,
    status: "in progress",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};


// Get an order from Firestore
export const getOrder = async (orderId: string): Promise<Order | null> => {
    const orderRef = doc(db, "orders", orderId);
    const docSnap = await getDoc(orderRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            userId: data.userId,
            createdAt: data.createdAt,
            totalPrice: data.totalPrice,
            status: data.status,
            items: data.items,
            username: data.username,
            phoneNumber: data.phoneNumber,
            hostel: data.hostel,
        } as Order;
    } else {
        return null;
    }
}
