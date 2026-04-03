import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "pantrysave_purchased_items";

function load(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

export function usePurchasedItems() {
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set(load()));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...purchasedIds]));
  }, [purchasedIds]);

  const markPurchased = useCallback((ids: string[]) => {
    setPurchasedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  return { purchasedIds, markPurchased };
}
