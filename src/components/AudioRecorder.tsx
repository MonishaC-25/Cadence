import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Check, AlertCircle } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob, durationSeconds: number) => void;
  onCancel?: () => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  onCancel,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      stopStreams();
    };
  }, []);

  const stopStreams = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
  };

  const startRecording = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setIsPaused(false);
      setSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);

      drawWaveform();
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setErrorMsg(
        err.name === 'NotAllowedError'
          ? 'Microphone permission was denied. Please allow microphone access in your browser.'
          : 'Unable to initialize microphone recording.'
      );
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerIntervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    stopStreams();
  };

  const resetRecording = () => {
    stopStreams();
    setAudioUrl(null);
    setIsRecording(false);
    setIsPaused(false);
    setSeconds(0);
    setIsPlayingPreview(false);
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;

        // Gradient emerald wave
        ctx.fillStyle = `rgb(52, 211, 153)`;
        ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth - 1, barHeight);

        x += barWidth;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  };

  const togglePreviewPlay = () => {
    if (!previewAudioRef.current && audioUrl) {
      const audio = new Audio(audioUrl);
      previewAudioRef.current = audio;
      audio.onended = () => setIsPlayingPreview(false);
    }

    if (previewAudioRef.current) {
      if (isPlayingPreview) {
        previewAudioRef.current.pause();
        setIsPlayingPreview(false);
      } else {
        previewAudioRef.current.play();
        setIsPlayingPreview(true);
      }
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  const handleConfirmAudio = () => {
    if (audioChunksRef.current.length > 0) {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      onRecordingComplete(blob, seconds);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 text-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Live Microphone Capture</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Record in-room conversation directly from your browser.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isRecording && (
            <span className="flex items-center gap-1.5 text-xs text-rose-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              REC {formatTimer(seconds)}
            </span>
          )}
          {!isRecording && audioUrl && (
            <span className="text-xs text-emerald-400 font-mono tabular-nums">
              Length: {formatTimer(seconds)}
            </span>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Visualizer canvas */}
      <div className="h-20 bg-slate-950/80 rounded-lg border border-slate-800/80 flex items-center justify-center relative overflow-hidden mb-4">
        {isRecording ? (
          <canvas
            ref={canvasRef}
            width={360}
            height={80}
            className="w-full h-full object-contain"
          />
        ) : audioUrl ? (
          <div className="flex items-center gap-3">
            <button
              onClick={togglePreviewPlay}
              className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 flex items-center justify-center transition-colors"
            >
              {isPlayingPreview ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
            <div className="text-left">
              <p className="text-xs font-medium text-slate-200">Recording captured</p>
              <p className="text-xs text-slate-400 font-mono">{formatTimer(seconds)} ready to process</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">Microphone visualizer idle. Press record to begin.</p>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 text-xs font-semibold rounded-lg transition-all"
          >
            <Mic className="w-4 h-4" />
            <span>Start Live Recording</span>
          </button>
        )}

        {isRecording && (
          <div className="flex items-center gap-2 w-full">
            {isPaused ? (
              <button
                onClick={resumeRecording}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                onClick={pauseRecording}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={stopRecording}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-500 hover:bg-rose-400 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop &amp; Save</span>
            </button>
          </div>
        )}

        {!isRecording && audioUrl && (
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={resetRecording}
              className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake</span>
            </button>

            <button
              onClick={handleConfirmAudio}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Use This Recording</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
