import { useState, useCallback, useEffect } from "react";
import type { FavoriteStation } from "../types/radio";

const STORAGE_KEY = "matrix-fm-favorites";

function loadFavorites(): FavoriteStation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteStation[]>(loadFavorites);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = useCallback((station: FavoriteStation) => {
    setFavorites(prev => {
      if (prev.some(f => f.id === station.id)) return prev;
      return [...prev, { ...station, addedAt: Date.now() }];
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.some(f => f.id === id),
    [favorites]
  );

  return { favorites, addFavorite, removeFavorite, isFavorite };
}
