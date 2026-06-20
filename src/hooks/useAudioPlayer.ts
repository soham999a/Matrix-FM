import { useRef, useState, useCallback, useEffect } from "react";
import type { RadioStation } from "../types/radio";

interface AudioPlayerState {
  currentStation: RadioStation | null;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  error: string | null;
}

const FFT_SIZE = 64;

export function useAudioPlayer(onPlayCallback?: (station: RadioStation) => void) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 2;
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(onPlayCallback);
  callbackRef.current = onPlayCallback;

  // Web Audio analyser refs (created once, live for app lifetime)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const freqDataRef = useRef<Uint8Array>(new Uint8Array(0));
  const analyserReady = useRef(false);

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
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    // Create Web Audio analyser pipeline (once)
    try {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      const source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(ctx.destination);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
      freqDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      analyserReady.current = true;
    } catch {
      analyserReady.current = false;
    }

    const onPlaying = async () => {
      // Resume AudioContext if suspended (autoplay policy)
      if (audioCtxRef.current?.state === "suspended") {
        await audioCtxRef.current.resume();
      }
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
      // Close audio context
      if (audioCtxRef.current) audioCtxRef.current.close();
      audio.pause();
      audio.src = "";
    };
  }, []);

  const getFrequencyData = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return null;
    analyser.getByteFrequencyData(freqDataRef.current as Uint8Array<ArrayBuffer>);
    return freqDataRef.current;
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

  return { ...state, play, togglePlay, stop, setVolume, clearError, getFrequencyData };
}
