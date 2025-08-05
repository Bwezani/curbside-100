
export interface Product {
  id: string;
  name: string;
  image: string;
  imageAlt: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  variations: { name: string; priceModifier: number }[];
  category: string;
  dataAiHint: string;
}
