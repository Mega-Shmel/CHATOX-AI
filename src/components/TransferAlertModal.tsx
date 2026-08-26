import React, { useState, useEffect } from 'react';
import { AlertTriangle, Lock, KeyRound, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage } from '../types';
import { getTranslation } from '../i18n/translations';

interface TransferAlertModalProps {
  isOpen: boolean;
  onVerifyPassword: (password: string) => boolean;
  onSuccess: () => void;
  accentColor: string;
  language?: AppLanguage;
}

export const TransferAlertModal: React.FC<TransferAlertModalProps> = ({
  isOpen,
  onVerifyPassword,
  onSuccess,
  accentColor,
  language = 'ru',
}) => {
  const t = getTranslation(language);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState<number | null>(null);

  // Check lockout timer
  useEffect(() => {
    if (!lockoutTimeRemaining || lockoutTimeRemaining <= 0) return;

    const timer = setInterval(() => {
      setLockoutTimeRemaining((prev) => {
        if (!prev || prev <= 1) {
          clearInterval(timer);
          setFailedAttempts(0);
          setErrorMsg('');
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutTimeRemaining]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimeRemaining && lockoutTimeRemaining > 0) return;

    if (!password) {
      setErrorMsg(t.transferPasswordPlaceholder);
      return;
    }

    const isValid = onVerifyPassword(password);
    if (isValid) {
      setErrorMsg('');
      setFailedAttempts(0);
      onSuccess();
    } else {
      const nextCount = failedAttempts + 1;
      setFailedAttempts(nextCount);
      setPassword('');

      if (nextCount >= 3) {
        setLockoutTimeRemaining(300); // 5 minutes (300 seconds)
        setErrorMsg(t.transferTooManyAttempts);
      } else {
        setErrorMsg(`${t.transferInvalidPassword} ${3 - nextCount}`);
      }
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isLocked = lockoutTimeRemaining !== null && lockoutTimeRemaining > 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-lg overflow-hidden border rounded-3xl border-red-500/50 shadow-[0_0_80px_rgba(239,68,68,0.4)] p-8 text-neutral-100"
          style={{
            backgroundColor: 'var(--panel-bg)',
          }}
        >
          {/* Ambient red warning glow */}
          <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none rounded-full bg-red-600/20 blur-3xl" />

          <div className="flex items-center gap-3.5 mb-4">
            <div className="flex items-center justify-center w-12 h-12 border rounded-2xl bg-red-950/60 border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.5)] text-red-400">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest text-red-400 uppercase">
                {t.transferAlertHeader}
              </span>
              <h2 className="text-xl font-bold text-white">{t.transferAlertTitle}</h2>
            </div>
          </div>

          <div className="p-4 mb-6 border rounded-2xl bg-red-950/20 border-red-500/30 text-neutral-200">
            <p className="text-sm leading-relaxed">
              {t.transferAlertDesc}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-xs font-semibold tracking-wide uppercase text-neutral-400">
                {t.transferPasswordLabel}
              </label>
              <div className="relative">
                <input
                  id="transfer-password-input"
                  type="password"
                  value={password}
                  disabled={isLocked}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLocked ? 'Locked' : t.transferPasswordPlaceholder}
                  className="w-full px-4 py-3.5 bg-black/70 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <Lock className="absolute w-5 h-5 -translate-y-1/2 right-3.5 top-1/2 text-neutral-500" />
              </div>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 text-xs font-medium text-red-300 border rounded-xl bg-red-950/40 border-red-500/40"
              >
                {isLocked ? <Clock className="w-4 h-4 text-red-400 animate-spin" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
                <span>
                  {errorMsg} {isLocked && `(${formatTimer(lockoutTimeRemaining)})`}
                </span>
              </motion.div>
            )}

            <button
              id="transfer-submit-btn"
              type="submit"
              disabled={isLocked}
              className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <KeyRound className="w-4 h-4" />
              <span>{t.transferUnlockBtn}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
