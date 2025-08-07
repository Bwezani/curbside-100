
import { collection, addDoc, serverTimestamp, getDoc, doc, getDocs, QueryDocumentSnapshot, DocumentData, orderBy, query, deleteDoc, setDoc, where } from "firebase/firestore";
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

// Helper to convert Firestore doc to Order
const toOrder = (doc: QueryDocumentSnapshot<DocumentData>): Order => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    createdAt: data.createdAt,
    totalPrice: data.totalPrice,
    status: data.status,
    items: data.items,
    username: data.username,
    phoneNumber: data.phoneNumber,
    hostel: data.hostel,
  } as Order;
};


// Get all orders from Firestore, sorted by creation date
export const getAllOrders = async (): Promise<Order[]> => {
  const ordersCollection = collection(db, "orders");
  const q = query(ordersCollection, orderBy("createdAt", "desc"));
  const orderSnapshot = await getDocs(q);
  const orderList = orderSnapshot.docs.map(toOrder);
  return orderList;
};

// Moves an order from the 'orders' collection to the 'completedOrders' collection
export const completeOrder = async (order: Order): Promise<void> => {
  const orderToDeleteRef = doc(db, "orders", order.id);
  const completedOrderRef = doc(db, "completedOrders", order.id);

  const completedOrderData = {
    ...order,
    status: "completed" as const,
  };
  
  // Using setDoc to create a document with the same ID in the new collection
  await setDoc(completedOrderRef, completedOrderData);

  // Deleting the original order
  await deleteDoc(orderToDeleteRef);
};

// Get all pending orders
export const getAllPendingOrders = async (): Promise<Order[]> => {
    const ordersCollection = collection(db, "orders");
    const q = query(ordersCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(toOrder);
};

// Get all completed orders
export const getAllCompletedOrders = async (): Promise<Order[]> => {
    const completedOrdersCollection = collection(db, "completedOrders");
    const q = query(completedOrdersCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(toOrder);
};

// DEPRECATED: Use client-side filtering instead.
// Get all pending orders for a specific user
export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
    const ordersCollection = collection(db, "orders");
    const q = query(ordersCollection, where("userId", "==", userId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(toOrder);
};

// DEPRECATED: Use client-side filtering instead.
// Get all completed orders for a specific user
export const getCompletedOrdersByUserId = async (userId: string): Promise<Order[]> => {
    const completedOrdersCollection = collection(db, "completedOrders");
    const q = query(completedOrdersCollection, where("userId", "==", userId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(toOrder);
};
