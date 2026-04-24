"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FocusTimerProps {
  primaryTaskTitle?: string;
}

export function FocusTimer({ primaryTaskTitle }: FocusTimerProps) {
  const [timeLeft, setTimeLeft] = useState(45 * 60); // Default 45 mins
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(45 * 60);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio if TIMER_SOUND_URL is set in env
    // Because we're in a client component, NEXT_PUBLIC_TIMER_SOUND_URL is needed
    // or just pass it as a prop. Let's assume process.env.NEXT_PUBLIC_TIMER_SOUND_URL
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
      audioRef.current?.play();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration);
  };

  const setPreset = (mins: number) => {
    setIsActive(false);
    setDuration(mins * 60);
    setTimeLeft(mins * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progress = ((duration - timeLeft) / duration) * 100;

  return (
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

      <div className="relative w-64 h-64 flex items-center justify-center mb-8">
        {/* Circular Progress */}
        <svg className="absolute w-full h-full transform -rotate-90">
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
            strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
            strokeLinecap="round"
          />
        </svg>
        <span className="text-6xl font-bold tabular-nums tracking-tighter">
          {formatTime(timeLeft)}
        </span>
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

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setPreset(25)} className="rounded-full">
          25 min
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPreset(45)} className="rounded-full">
          45 min
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPreset(60)} className="rounded-full">
          60 min
        </Button>
      </div>
    </div>
  );
}
