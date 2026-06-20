import { useState, useCallback, useEffect } from "react";
import type { RadioStation } from "../types/radio";

const STORAGE_KEY = "matrix-fm-recently-played";
const MAX_ITEMS = 10;

function load(): RadioStation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function useRecentlyPlayed() {
  const [recent, setRecent] = useState<RadioStation[]>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
  }, [recent]);

  const addRecent = useCallback((station: RadioStation) => {
    setRecent(prev => {
      const filtered = prev.filter(s => s.id !== station.id);
      return [station, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
  }, []);

  return { recent, addRecent, clearRecent };
}
