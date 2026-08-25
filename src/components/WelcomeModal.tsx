import React, { useState } from 'react';
import { Sparkles, ArrowRight, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getContrastColor } from '../utils/color';

interface WelcomeModalProps {
  isOpen: boolean;
  onSaveName: (name: string) => void;
  onSkip: () => void;
  accentColor: string;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onSaveName,
  onSkip,
  accentColor,
}) => {
  const [nameInput, setNameInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onSaveName(nameInput.trim());
    } else {
      onSkip();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg overflow-hidden border rounded-3xl shadow-[0_0_60px_rgba(138,43,226,0.35)] p-8 text-neutral-100"
          style={{
            backgroundColor: 'var(--panel-bg)',
            borderColor: `${accentColor}50`,
            boxShadow: `0 0 80px ${accentColor}30`,
          }}
        >
          {/* Top ambient glow */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-40"
            style={{ backgroundColor: accentColor }}
          />

          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex items-center justify-center w-12 h-12 border rounded-2xl bg-purple-950/40 border-purple-500/50 shadow-[0_0_20px_rgba(138,43,226,0.5)]"
            >
              <Sparkles className="w-6 h-6 text-purple-300 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider text-purple-400 uppercase">
                CHATOX AI &bull; Первый запуск
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-white">Здравствуйте!</h2>
            </div>
          </div>

          <p className="mb-6 text-sm leading-relaxed text-neutral-300">
            Пожалуйста, введите своё имя или что угодно, вы можете изменить то, что вы ввели, в любое время в настройках.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <input
                id="welcome-name-input"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ваше имя или никнейм..."
                autoFocus
                className="w-full px-4 py-3.5 bg-black/60 border border-purple-500/40 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition-all text-base"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                id="welcome-skip-btn"
                type="button"
                onClick={onSkip}
                className="px-5 py-3 text-sm font-medium transition-colors border rounded-xl text-neutral-400 border-white/10 hover:bg-white/5 hover:text-neutral-200"
              >
                Пропустить
              </button>

              <button
                id="welcome-confirm-btn"
                type="submit"
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all border rounded-xl shadow-lg active:scale-95"
                style={{
                  backgroundColor: accentColor,
                  borderColor: `${accentColor}80`,
                  color: getContrastColor(accentColor),
                  boxShadow: `0 0 25px ${accentColor}80`,
                }}
              >
                <UserCheck className="w-4 h-4" />
                <span>Начать сессию</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
