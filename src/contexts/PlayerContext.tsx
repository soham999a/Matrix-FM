import { createContext, useContext, useCallback, type ReactNode } from "react";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useFavorites } from "../hooks/useFavorites";
import { useRecentlyPlayed } from "../hooks/useRecentlyPlayed";
import { useSleepTimer } from "../hooks/useSleepTimer";
import { toast } from "../components/Toasts";
import type { RadioStation } from "../types/radio";

interface PlayerContextType {
  player: ReturnType<typeof useAudioPlayer> & {
    playWithTracking: (station: RadioStation) => void;
  };
  favorites: ReturnType<typeof useFavorites>;
  recentlyPlayed: ReturnType<typeof useRecentlyPlayed>;
  sleepTimer: ReturnType<typeof useSleepTimer>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const recentlyPlayed = useRecentlyPlayed();
  const sleepTimer = useSleepTimer();

  const audioPlayer = useAudioPlayer(
    useCallback(
      (station: RadioStation) => {
        recentlyPlayed.addRecent(station);
      },
      [recentlyPlayed]
    )
  );

  const favorites = useFavorites();
  const favoritesWithToast = {
    ...favorites,
    addFavorite: useCallback(
      (station: import("../types/radio").FavoriteStation) => {
        if (!favorites.isFavorite(station.id)) {
          favorites.addFavorite(station);
          toast(`${station.name} saved`, "success");
        }
      },
      [favorites]
    ),
    removeFavorite: useCallback(
      (id: string) => {
        favorites.removeFavorite(id);
        toast("Removed from favorites", "info");
      },
      [favorites]
    ),
  };

  const playWithTracking = useCallback(
    (station: RadioStation) => {
      if (audioPlayer.currentStation?.id === station.id && audioPlayer.isPlaying) {
        return; // Already playing this station
      }
      if (sleepTimer.active) {
        sleepTimer.cancelTimer();
        toast("Sleep timer cancelled", "info");
      }
      audioPlayer.play(station);
    },
    [audioPlayer, sleepTimer]
  );

  const player = { ...audioPlayer, playWithTracking };

  return (
    <PlayerContext.Provider value={{ player, favorites: favoritesWithToast, recentlyPlayed, sleepTimer }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within PlayerProvider");
  return context;
}
