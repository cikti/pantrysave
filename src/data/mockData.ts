import tomatoes from "@/assets/tomatoes.jpg";
import rice from "@/assets/rice.jpg";
import veggies from "@/assets/veggies.jpg";
import chicken from "@/assets/chicken.jpg";
import sauces from "@/assets/sauces.jpg";
import imperfect from "@/assets/imperfect.jpg";

export type GroceryItem = {
  id: string;
  name: string;
  seller: string;
  image: string;
  category: string;
  weight: string;
  originalPrice: number;
  clearancePrice: number;
  badge: string;
  badgeType: "expiry" | "imperfect" | "overstock";
  reason: string;
};

export const categories = [
  "All",
  "Fresh Produce",
  "Dry Pantry",
  "Meat & Dairy",
  "Imperfect/Ugly Veggies",
  "Mystery Bundles",
];

export const groceryItems: GroceryItem[] = [
  {
    id: "1",
    name: "Vine Tomatoes",
    seller: "Ali Minimart",
    image: tomatoes,
    category: "Fresh Produce",
    weight: "1kg",
    originalPrice: 8.9,
    clearancePrice: 3.5,
    badge: "Expires in 3 Days",
    badgeType: "expiry",
    reason: "Approaching best-before date but perfectly fresh and safe to eat.",
  },
  {
    id: "2",
    name: "Jasmine Rice 5kg",
    seller: "Kedai Ah Seng",
    image: rice,
    category: "Dry Pantry",
    weight: "5kg",
    originalPrice: 25.0,
    clearancePrice: 15.0,
    badge: "Overstock",
    badgeType: "overstock",
    reason: "Excess stock from bulk purchase. Packaging intact, long shelf life.",
  },
  {
    id: "3",
    name: "Mixed Veggie Basket",
    seller: "Pasar Taman Sri",
    image: veggies,
    category: "Fresh Produce",
    weight: "Bundle",
    originalPrice: 15.0,
    clearancePrice: 6.0,
    badge: "Expires in 2 Days",
    badgeType: "expiry",
    reason: "End-of-day market surplus. Still crunchy and fresh for cooking.",
  },
  {
    id: "4",
    name: "Chicken Thigh Cuts",
    seller: "Butcher Bros",
    image: chicken,
    category: "Meat & Dairy",
    weight: "500g",
    originalPrice: 14.5,
    clearancePrice: 7.9,
    badge: "Expires Tomorrow",
    badgeType: "expiry",
    reason: "Best before tomorrow. Perfect for tonight's dinner!",
  },
  {
    id: "5",
    name: "Cooking Sauces Set",
    seller: "Kak Lina's Pantry",
    image: sauces,
    category: "Dry Pantry",
    weight: "3 bottles",
    originalPrice: 18.0,
    clearancePrice: 9.0,
    badge: "Imperfect Box",
    badgeType: "imperfect",
    reason: "Packaging dented but contents are perfectly safe to consume.",
  },
  {
    id: "6",
    name: "Ugly Veggie Surprise",
    seller: "Aunty Mei's Farm",
    image: imperfect,
    category: "Imperfect/Ugly Veggies",
    weight: "2kg",
    originalPrice: 12.0,
    clearancePrice: 4.0,
    badge: "Imperfect Look",
    badgeType: "imperfect",
    reason: "Oddly shaped but taste exactly the same. Reduce food waste!",
  },
];
