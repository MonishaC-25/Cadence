import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, FastForward, RotateCcw } from 'lucide-react';

interface AudioPlayerBarProps {
  fileName?: string;
  totalDurationSeconds?: number;
  seekTime?: number | null;
  onSeekHandled?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  fileName = 'meeting_recording.mp3',
  totalDurationSeconds = 480,
  seekTime,
  onSeekHandled,
  onTimeUpdate,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState<1 | 1.25 | 1.5 | 2>(1);

  // If seekTime is requested from outside (e.g. clicking a transcript timestamp)
  useEffect(() => {
    if (seekTime !== undefined && seekTime !== null) {
      setCurrentTime(seekTime);
      setIsPlaying(true);
      if (onSeekHandled) onSeekHandled();
    }
  }, [seekTime, onSeekHandled]);

  // Simulated continuous playback timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1 * speed;
          if (next >= totalDurationSeconds) {
            setIsPlaying(false);
            return totalDurationSeconds;
          }
          if (onTimeUpdate) onTimeUpdate(next);
          return next;
        });
      }, 1000 / speed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, speed, totalDurationSeconds, onTimeUpdate]);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = Math.floor(sec % 60);
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (onTimeUpdate) onTimeUpdate(val);
  };

  const cycleSpeed = () => {
    const speeds: Array<1 | 1.25 | 1.5 | 2> = [1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(speed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setSpeed(speeds[nextIndex]);
  };

  const progressPercent = Math.min(100, (currentTime / Math.max(1, totalDurationSeconds)) * 100);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 text-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Play button and file title */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 flex items-center justify-center shrink-0 transition-all shadow-sm"
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <div className="truncate">
            <p className="text-xs font-medium text-white truncate max-w-[200px] sm:max-w-[240px]">
              {fileName}
            </p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono tabular-nums">
              <span>{formatSeconds(currentTime)}</span>
              <span>/</span>
              <span>{formatSeconds(totalDurationSeconds)}</span>
            </p>
          </div>
        </div>

        {/* Center: Waveform scrubber */}
        <div className="flex-1 w-full flex items-center gap-2">
          <div className="relative w-full flex items-center group">
            {/* Custom scrubber track */}
            <input
              type="range"
              min={0}
              max={totalDurationSeconds}
              value={currentTime}
              onChange={handleScrubberChange}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Right: Controls & Speed */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setCurrentTime(0)}
            className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
            title="Rewind to start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={cycleSpeed}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-mono font-medium transition-colors tabular-nums"
            title="Toggle playback speed"
          >
            {speed}x
          </button>
        </div>
      </div>
    </div>
  );
};
