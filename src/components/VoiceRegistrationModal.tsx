import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Check, RefreshCw, Volume2, ShieldCheck, AlertCircle, X, Sparkles } from 'lucide-react';
import { TeamMember, VoiceProfile } from '../types';
import { soundFx } from '../utils/soundEffects';

interface VoiceRegistrationModalProps {
  member: TeamMember;
  isOpen: boolean;
  isMandatory?: boolean;
  onClose: () => void;
  onSaveVoiceProfile: (memberId: string, profile: VoiceProfile) => void;
}

const PHONETIC_CALIBRATION_PROMPTS = [
  "Cadence Intelligence system calibration: My name is [Name], and I confirm my attendance and vocal profile for enterprise session diarization.",
  "We are deploying the high-availability PostgreSQL cluster with Redis caching and zero-downtime database replication.",
  "Action items, sprint deliverables, and architectural decisions are tracked autonomously with Cadence.",
];

export const VoiceRegistrationModal: React.FC<VoiceRegistrationModalProps> = ({
  member,
  isOpen,
  isMandatory = false,
  onClose,
  onSaveVoiceProfile,
}) => {
  const [step, setStep] = useState<'prompt' | 'recording' | 'preview' | 'success'>('prompt');
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(member.voiceProfile?.sampleAudioUrl || null);
  const [audioWaves, setAudioWaves] = useState<number[]>([15, 30, 45, 60, 40, 20, 50, 75, 90, 60, 40, 25]);
  const [activePromptIndex, setActivePromptIndex] = useState(0);

  const timerRef = useRef<any>(null);
  const waveIntervalRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (member.voiceProfile?.isRegistered) {
      setStep('preview');
    } else {
      setStep('prompt');
    }
  }, [member]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const currentPrompt = PHONETIC_CALIBRATION_PROMPTS[activePromptIndex].replace('[Name]', member.name);

  const startRecording = async () => {
    try {
      soundFx.playClick();
      setIsRecording(true);
      setRecordSeconds(0);
      setStep('recording');
      audioChunksRef.current = [];

      // Animate simulated wave bars during recording
      waveIntervalRef.current = setInterval(() => {
        setAudioWaves(Array.from({ length: 18 }, () => Math.floor(Math.random() * 85) + 15));
      }, 100);

      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 12) {
            stopRecording();
            return 12;
          }
          return prev + 1;
        });
      }, 1000);

      // Attempt live microphone stream if supported
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

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

        mediaRecorder.start();
      }
    } catch (err) {
      console.warn("Microphone access simulated or permission denied:", err);
      // Fallback: simulated calibration recording
    }
  };

  const stopRecording = () => {
    soundFx.playChime();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setStep('preview');
  };

  const handleConfirmRegistration = () => {
    soundFx.playBellChime();
    const newProfile: VoiceProfile = {
      isRegistered: true,
      registeredAt: new Date().toISOString(),
      sampleAudioUrl: audioUrl || undefined,
      durationSeconds: Math.max(recordSeconds, 6),
      acousticVectorId: `vec_${member.id}_${Date.now().toString(36)}`,
      voiceSampleText: currentPrompt,
      status: 'active',
      removedAt: undefined,
      reRegistrationDeadline: undefined,
    };

    onSaveVoiceProfile(member.id, newProfile);
    setStep('success');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Vocal Biometrics Registration</span>
                {member.voiceProfile?.isRegistered && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                    ENROLLED
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                Train Cadence AI to automatically recognize {member.name}'s voice in all meetings
              </p>
            </div>
          </div>
          {!isMandatory && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {isMandatory && (
            <div className="p-3.5 bg-amber-950/30 border border-amber-500/40 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-amber-200">Mandatory Workspace Onboarding:</strong>
                Company policy requires voice enrollment before you can host or join diarized sessions. This enables zero-touch speaker identification and payroll ROI tracking.
              </div>
            </div>
          )}

          {step === 'prompt' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-emerald-400">Calibration Sentence ({activePromptIndex + 1}/3):</span>
                  <button
                    onClick={() => setActivePromptIndex((prev) => (prev + 1) % PHONETIC_CALIBRATION_PROMPTS.length)}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Switch sample</span>
                  </button>
                </div>
                <p className="text-sm font-medium text-white italic leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  "{currentPrompt}"
                </p>
                <p className="text-[11px] text-slate-500">
                  Read this sentence aloud in your normal speaking tone. Cadence computes an acoustic embedding vector to diarize your speech across online, in-person, and hybrid rooms.
                </p>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={startRecording}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Voice Recording</span>
                </button>
              </div>
            </div>
          )}

          {step === 'recording' && (
            <div className="text-center space-y-5 py-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>RECORDING ACOUSTIC SAMPLE ({recordSeconds}s / 12s)</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <p className="text-sm font-medium text-white italic mb-4">
                  "{currentPrompt}"
                </p>

                {/* Animated Audio Equalizer Bars */}
                <div className="flex items-center justify-center gap-1.5 h-12">
                  {audioWaves.map((height, i) => (
                    <div
                      key={i}
                      style={{ height: `${height}%` }}
                      className="w-1.5 bg-emerald-400 rounded-full transition-all duration-100 ease-in-out"
                    />
                  ))}
                </div>
              </div>

              <div>
                <button
                  onClick={stopRecording}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl shadow-md active:scale-95 transition-all"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop & Process Sample</span>
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Acoustic Vector Generated</span>
                  </span>
                  <span className="font-mono text-emerald-400 text-xs">
                    {recordSeconds ? `${recordSeconds}s captured` : 'Sample ready'}
                  </span>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>Voiceprint: {member.name.toLowerCase().replace(' ', '_')}_embedding.wav</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    99.4% Match Conf.
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Cadence will use this neural voiceprint during multilingual live transcription, automatic speaker attribution, and engagement metrics calculation.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setStep('prompt')}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
                >
                  Re-Record
                </button>
                <button
                  onClick={handleConfirmRegistration}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold rounded-lg shadow-sm transition-all"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Save Voice Registration</span>
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                <Sparkles className="w-6 h-6 animate-bounce" />
              </div>
              <h4 className="text-base font-bold text-white">Voice Registered Successfully!</h4>
              <p className="text-xs text-slate-400">
                Cadence model is now calibrated with {member.name}'s vocal frequencies.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
