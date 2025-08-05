import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { db } from "./firebaseClient";
import type { Product } from "@/lib/types";

// Helper function to convert a Firestore document to a Product object
const toProduct = (doc: QueryDocumentSnapshot<DocumentData>): Product => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name || "",
    image: data.image || "",
    imageAlt: data.imageAlt || "",
    shortDescription: data.shortDescription || "",
    fullDescription: data.fullDescription || "",
    price: data.price || 0,
    variations: data.variations || [],
    category: data.category || "",
    dataAiHint: data.dataAiHint || "",
  };
};

export const getProducts = async (): Promise<Product[]> => {
  const productsCollection = collection(db, "products");
  const productSnapshot = await getDocs(productsCollection);
  const productList = productSnapshot.docs.map(toProduct);
  return productList;
};
