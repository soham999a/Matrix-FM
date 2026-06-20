import { useState, useEffect, useCallback, useRef } from "react";
import { HashRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PlayerProvider, usePlayer } from "./contexts/PlayerContext";
import { SplashScreen } from "./components/SplashScreen";
import { AppBar } from "./components/AppBar";
import { BottomNav } from "./components/BottomNav";
import { NowPlaying } from "./components/NowPlaying";
import { StationList } from "./components/StationList";
import { Settings } from "./components/Settings";
import { ExitDialog } from "./components/ExitDialog";
import { AudioPlayer } from "./components/AudioPlayer";
import { Toasts, useToasts } from "./components/Toasts";

const queryClient = new QueryClient();

function AppShell() {
  const [splashDone, setSplashDone] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { player } = usePlayer();
  const isHome = location.pathname === "/";
  const historyPushed = useRef(false);
  const { toasts, removeToast } = useToasts();

  useEffect(() => {
    if (isHome && !historyPushed.current) {
      window.history.pushState(null, "", window.location.href);
      historyPushed.current = true;
    }
    if (!isHome) {
      historyPushed.current = false;
    }
  }, [isHome]);

  useEffect(() => {
    const onPopState = () => {
      if (exitOpen) {
        setExitOpen(false);
      } else if (isHome) {
        setExitOpen(true);
      } else {
        navigate(-1);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isHome, navigate, exitOpen]);

  const handleExit = useCallback(() => {
    player.stop();
    setExitOpen(false);
    if (typeof window !== "undefined" && "Capacitor" in window) {
      // @ts-expect-error - Capacitor native exit
      window.Capacitor.Plugins.App.exitApp();
    } else {
      window.close();
    }
  }, [player]);

  if (!splashDone) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  return (
    <div className="flex flex-col min-h-dvh bg-ink">
      <AppBar
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ["stations"] });
        }}
      />

      <Toasts toasts={toasts} onRemove={removeToast} />

      <main className="flex-1 flex flex-col overflow-hidden pb-14">
        <Routes>
          <Route path="/" element={<NowPlaying />} />
          <Route path="/stations" element={<StationList />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      <AudioPlayer />
      <BottomNav />
      <ExitDialog
        open={exitOpen}
        onStay={() => setExitOpen(false)}
        onExit={handleExit}
      />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PlayerProvider>
        <HashRouter>
          <AppShell />
        </HashRouter>
      </PlayerProvider>
    </QueryClientProvider>
  );
}
