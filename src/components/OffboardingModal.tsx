import React, { useState } from 'react';
import { HeartCrack, ShieldAlert, MicOff, Trash2, Calendar, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import { TeamMember } from '../types';
import { soundFx } from '../utils/soundEffects';

interface OffboardingModalProps {
  member: TeamMember;
  isOpen: boolean;
  onClose: () => void;
  onConfirmQuittingNotice: (memberId: string, daysNotice: number, adminNotes: string) => void;
  onRemoveVoiceProfile: (memberId: string) => void;
  onRestoreVoiceProfile: (memberId: string) => void;
  onFinalizeTermination: (memberId: string) => void;
}

export const OffboardingModal: React.FC<OffboardingModalProps> = ({
  member,
  isOpen,
  onClose,
  onConfirmQuittingNotice,
  onRemoveVoiceProfile,
  onRestoreVoiceProfile,
  onFinalizeTermination,
}) => {
  const [daysNotice, setDaysNotice] = useState<number>(member.offboarding?.noticePeriodDays || 7);
  const [adminNotes, setAdminNotes] = useState<string>(member.offboarding?.adminNoticeNotes || '');
  const [confirmStep, setConfirmStep] = useState(false);

  if (!isOpen) return null;

  const isQuitting = member.offboarding?.isQuitting;
  const voiceRemoved = member.voiceProfile?.status === 'removed';

  // Calculate 48h deadline if voice removed
  const reRegistrationDeadline = member.voiceProfile?.reRegistrationDeadline;

  const handleSetQuitting = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playChime();
    onConfirmQuittingNotice(member.id, Number(daysNotice) || 7, adminNotes);
    onClose();
  };

  const handlePurgeVoice = () => {
    if (confirm(`Remove vocal biometrics and acoustic embedding for ${member.name}? Under company policy, they will have 48 hours to restore enrollment if this was done in error.`)) {
      soundFx.playClick();
      onRemoveVoiceProfile(member.id);
    }
  };

  const handleFinalErase = () => {
    if (confirm(`Permanently remove ${member.name} from the company workspace? All historical meeting transcripts will retain their name, but their login and active permissions will be deleted.`)) {
      onFinalizeTermination(member.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <HeartCrack className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Employee Departure &amp; Voice De-provisioning
              </h3>
              <p className="text-[11px] text-slate-400">
                Manage offboarding status and biometric purge for {member.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Status banner */}
          {isQuitting ? (
            <div className="p-4 bg-rose-950/30 border border-rose-500/40 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-rose-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Departure Notice Active</span>
                </span>
                <span className="font-mono text-xs bg-rose-900/60 px-2 py-0.5 rounded text-white tabular-nums">
                  {member.offboarding?.daysRemaining ?? member.offboarding?.noticePeriodDays} days notice
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Departure announced. The employee received an automated notification: <em>"We are sorry to know that you are leaving. Kindly remove your voice from your profile before your final departure date."</em>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSetQuitting} className="space-y-4">
              <p className="text-slate-300 leading-relaxed">
                Marking this employee as departing triggers an offboarding banner on their dashboard requesting them to remove their registered voice profile within the specified notice period.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Notice Period Window (Days) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={daysNotice}
                    onChange={(e) => setDaysNotice(Number(e.target.value))}
                    className="w-28 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-rose-500 focus:outline-none"
                    required
                  />
                  <span className="text-slate-400 text-xs">days to clear vocal data</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Departure Notes / Transition Summary
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Resignation submitted. Handing over database architecture tasks to Aoi."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl shadow transition-all flex items-center justify-center gap-2"
              >
                <HeartCrack className="w-4 h-4" />
                <span>Issue Employee Departure Notice</span>
              </button>
            </form>
          )}

          {/* Voice Registration Status & 48-Hour Recovery Window */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Voice Biometrics Status:</span>
              {voiceRemoved ? (
                <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 rounded font-bold">
                  VOICE PURGED / REMOVED
                </span>
              ) : member.voiceProfile?.isRegistered ? (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded font-bold">
                  ACTIVE ACOUSTIC VECTOR
                </span>
              ) : (
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded font-bold">
                  NOT YET REGISTERED
                </span>
              )}
            </div>

            {voiceRemoved && reRegistrationDeadline && (
              <div className="p-2.5 bg-amber-950/40 border border-amber-500/30 rounded-lg text-[11px] text-amber-300">
                <p className="font-semibold">⚠️ 48-Hour Grace Period Active:</p>
                <p className="text-slate-300 mt-0.5">
                  Voice was removed. If done unintentionally, the employee or admin must re-register within 48 hours ({new Date(reRegistrationDeadline).toLocaleString()}), or admin is alerted for complete offboarding.
                </p>
                <button
                  onClick={() => onRestoreVoiceProfile(member.id)}
                  className="mt-2 text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Restore Vocal Profile Within 48-Hour Window</span>
                </button>
              </div>
            )}

            {!voiceRemoved && member.voiceProfile?.isRegistered && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400 text-[11px]">
                  Manual Purge (GDPR / Right to Deletion)
                </span>
                <button
                  onClick={handlePurgeVoice}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 text-xs rounded-lg border border-slate-700 transition-colors"
                >
                  <MicOff className="w-3.5 h-3.5 text-rose-400" />
                  <span>Purge Voice Vector</span>
                </button>
              </div>
            )}
          </div>

          {/* Final Workspace Erase */}
          {isQuitting && (
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">
                Offboarding Complete?
              </span>
              <button
                onClick={handleFinalErase}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Finalize Account Termination</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
