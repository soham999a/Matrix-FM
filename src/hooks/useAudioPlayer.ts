import { useRef, useState, useCallback, useEffect } from "react";
import type { RadioStation } from "../types/radio";

interface AudioPlayerState {
  currentStation: RadioStation | null;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  error: string | null;
}

export function useAudioPlayer(onPlayCallback?: (station: RadioStation) => void) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 2;
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(onPlayCallback);
  callbackRef.current = onPlayCallback;

  const [state, setState] = useState<AudioPlayerState>({
    currentStation: null,
    isPlaying: false,
    isLoading: false,
    volume: 0.8,
    error: null,
  });

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;

    const onPlaying = () => {
      setState(prev => ({ ...prev, isPlaying: true, isLoading: false, error: null }));
    };
    const onPause = () => {
      setState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
    };
    const onWaiting = () => {
      setState(prev => ({ ...prev, isLoading: true }));
    };
    const onError = () => {
      setState(prev => {
        if (retryCount.current < maxRetries) {
          retryCount.current++;
          retryTimer.current = setTimeout(() => {
            const cur = audioRef.current;
            if (cur && cur.src) {
              cur.play().catch(() => {});
            }
          }, 2000 * retryCount.current);
          return { ...prev, isLoading: true, error: null };
        }
        return {
          ...prev,
          isPlaying: false,
          isLoading: false,
          error: "Station offline or unreachable",
        };
      });
    };
    const onEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("error", onError);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("ended", onEnded);
      if (retryTimer.current) clearTimeout(retryTimer.current);
      audio.pause();
      audio.src = "";
    };
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const play = useCallback((station: RadioStation) => {
    const audio = audioRef.current;
    if (!audio) return;

    const url = station.url_resolved || station.url;
    if (!url) {
      setState(prev => ({ ...prev, error: "No stream URL available" }));
      return;
    }

    if (retryTimer.current) clearTimeout(retryTimer.current);
    retryCount.current = 0;

    setState(prev => ({
      ...prev,
      currentStation: station,
      isLoading: true,
      error: null,
    }));

    audio.src = url;
    audio.play().catch(() => {
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isLoading: false,
        error: "Playback failed",
      }));
    });

    callbackRef.current?.(station);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentStation) return;

    if (state.isPlaying) {
      audio.pause();
    } else if (state.error) {
      audio.play().catch(() => {
        setState(prev => ({ ...prev, error: "Playback failed" }));
      });
    } else {
      audio.play().catch(() => {
        setState(prev => ({ ...prev, error: "Playback failed" }));
      });
    }
  }, [state.isPlaying, state.currentStation, state.error]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (retryTimer.current) clearTimeout(retryTimer.current);
    retryCount.current = 0;
    audio.pause();
    audio.src = "";
    setState({
      currentStation: null,
      isPlaying: false,
      isLoading: false,
      volume: state.volume,
      error: null,
    });
  }, [state.volume]);

  const setVolume = useCallback((vol: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const clamped = Math.min(1, Math.max(0, vol));
    audio.volume = clamped;
    setState(prev => ({ ...prev, volume: clamped }));
  }, []);

  return { ...state, play, togglePlay, stop, setVolume, clearError };
}
