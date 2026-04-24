"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Confetti from "react-confetti";

interface FocusTimerProps {
  primaryTaskTitle?: string;
}

export function FocusTimer({ primaryTaskTitle }: FocusTimerProps) {
  const [timeLeft, setTimeLeft] = useState(45 * 60); // Default 45 mins
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(45 * 60);
  const [youtubeLink, setYoutubeLink] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [showYoutubePopup, setShowYoutubePopup] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(45);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const soundUrl = process.env.NEXT_PUBLIC_TIMER_SOUND_URL || "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
    audioRef.current = new Audio(soundUrl);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setShowCelebration(true);
      if (youtubeLink && getYoutubeVideoId(youtubeLink)) {
        setShowYoutubePopup(true);
      } else {
        audioRef.current?.play();
      }
      setTimeout(() => setShowCelebration(false), 8000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, youtubeLink]);

  useEffect(() => {
    const h = Math.floor(timeLeft / 3600);
    const m = Math.floor((timeLeft % 3600) / 60);
    const s = timeLeft % 60;

    setHours(h);
    setMinutes(m);
    setSeconds(s);
  }, [timeLeft]);

  const toggleTimer = () => {
    if (!isActive && !youtubeLink) {
      setYoutubeLink(process.env.NEXT_PUBLIC_DEFAULT_MUSIC_URL || "https://www.youtube.com/watch?v=jfKfPfyJRdk");
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration);
  };

  const setPreset = (mins: number) => {
    setIsActive(false);

    const total = mins * 60;

    setDuration(total);
    setTimeLeft(total);

    setHours(Math.floor(total / 3600));
    setMinutes(Math.floor((total % 3600) / 60));
    setSeconds(0);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isActive) return;

    const value = e.target.value;

    if (!/^[0-9:]*$/.test(value)) return;

    const parts = value.split(":");

    const h = parseInt(parts[0]) || 0;
    const m = parseInt(parts[1]) || 0;
    const s = parts[2] ? parseInt(parts[2]) || 0 : 0;

    const totalSeconds = h * 3600 + m * 60 + s;

    setDuration(totalSeconds);
    setTimeLeft(totalSeconds);
  };

  const getYoutubeVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const updateTime = (e: React.ChangeEvent<HTMLInputElement>, type: 'h' | 'm' | 's') => {
    if (isActive) return;

    const val = Math.max(0, parseInt(e.target.value) || 0);

    let h = hours;
    let m = minutes;
    let s = seconds;

    if (type === 'h') {
      h = val;
      setHours(val);
    }
    if (type === 'm') {
      m = Math.min(val, 59);
      setMinutes(m);
    }
    if (type === 's') {
      s = Math.min(val, 59);
      setSeconds(s);
    }

    const total = h * 3600 + m * 60 + s;

    setDuration(total);
    setTimeLeft(total);
  };

  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;

  return (
    <>
      {showCelebration && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti width={windowSize.width} height={windowSize.height} />
        </div>
      )}

      <div className="flex flex-col items-center justify-center p-8 bg-card rounded-2xl border shadow-sm">
        {isActive && primaryTaskTitle ? (
          <h2 className="text-xl font-medium mb-6 text-center animate-pulse text-primary">
            Focusing on: {primaryTaskTitle}
          </h2>
        ) : (
          <h2 className="text-xl font-medium mb-6 text-center text-muted-foreground">
            Ready to focus?
          </h2>
        )}

        <div className="w-full flex justify-center">
          <div className="relative mx-auto w-72 h-72 flex items-center justify-center mb-8">
            {/* Circular Progress */}
            <svg viewBox="0 0 256 256" className="absolute w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                className="stroke-muted fill-none"
                strokeWidth="8"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                className="stroke-primary fill-none transition-all duration-1000 ease-linear"
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 120}
                strokeDashoffset={duration > 0 ? 2 * Math.PI * 120 * (1 - progress / 100) : 2 * Math.PI * 120}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute z-10 flex items-center gap-1 text-4xl font-bold tabular-nums">
              <input
                type="text"
                inputMode="numeric"
                min={0}
                max={23}
                value={String(hours).padStart(2, '0')}
                onChange={(e) => updateTime(e, 'h')}
                disabled={isActive}
                className="w-16 text-center bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              :
              <input
                type="text"
                inputMode="numeric"
                min={0}
                max={59}
                value={String(minutes).padStart(2, '0')}
                onChange={(e) => updateTime(e, 'm')}
                disabled={isActive}
                className="w-16 text-center bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              :
              <input
                type="text"
                inputMode="numeric"
                min={0}
                max={59}
                value={String(seconds).padStart(2, '0')}
                onChange={(e) => updateTime(e, 's')}
                disabled={isActive}
                className="w-16 text-center bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <Button
            size="lg"
            variant={isActive ? "outline" : "default"}
            className="w-32 rounded-full"
            onClick={toggleTimer}
          >
            {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
            {isActive ? "Pause" : "Start"}
          </Button>
          <Button size="lg" variant="secondary" className="rounded-full px-4" onClick={resetTimer}>
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs mb-8">
          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="YouTube Alarm Link..."
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                disabled={isActive}
                className="pl-9 rounded-full bg-secondary/50 border-none disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreset(25)} disabled={isActive} className="rounded-full disabled:opacity-50">
            25 min
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPreset(45)} disabled={isActive} className="rounded-full disabled:opacity-50">
            45 min
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPreset(60)} disabled={isActive} className="rounded-full disabled:opacity-50">
            60 min
          </Button>
        </div>

        <Dialog open={showYoutubePopup} onOpenChange={setShowYoutubePopup}>
          <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-black border-zinc-800">
            <DialogHeader className="p-4 bg-zinc-950 text-white">
              <DialogTitle>Time's up! 🎉</DialogTitle>
            </DialogHeader>
            <div className="aspect-video w-full bg-black">
              {showYoutubePopup && youtubeLink && getYoutubeVideoId(youtubeLink) && (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${getYoutubeVideoId(youtubeLink)}?autoplay=1&loop=0`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
