import React, { useState } from 'react';
import { Sparkles, ArrowRight, UserCheck, Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getContrastColor } from '../utils/color';
import { AppLanguage, getTranslation } from '../i18n/translations';

interface WelcomeModalProps {
  isOpen: boolean;
  onSaveProfile: (name: string, language: AppLanguage) => void;
  onSkip: (language: AppLanguage) => void;
  accentColor: string;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onSaveProfile,
  onSkip,
  accentColor,
}) => {
  const [step, setStep] = useState<'language' | 'name'>('language');
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>('en');
  const [nameInput, setNameInput] = useState('');

  if (!isOpen) return null;

  const t = getTranslation(selectedLanguage);

  const handleLanguageSelect = (lang: AppLanguage) => {
    setSelectedLanguage(lang);
  };

  const handleContinueToName = () => {
    setStep('name');
  };

  const handleSubmitName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onSaveProfile(nameInput.trim(), selectedLanguage);
    } else {
      onSkip(selectedLanguage);
    }
  };

  const languages: { id: AppLanguage; label: string; subLabel: string; flag: string }[] = [
    { id: 'en', label: 'English', subLabel: 'Default / International', flag: '🇬🇧' },
    { id: 'ru', label: 'Русский', subLabel: 'Russian / Полная поддержка РФ', flag: '🇷🇺' },
    { id: 'zh', label: '简体中文', subLabel: 'Chinese / 简体中文', flag: '🇨🇳' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg overflow-hidden border rounded-3xl p-6 sm:p-8 text-neutral-100"
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

          {/* STEP 1: LANGUAGE SELECTION (English by default on first view) */}
          {step === 'language' ? (
            <motion.div
              key="step-language"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-12 h-12 border rounded-2xl shrink-0"
                  style={{
                    backgroundColor: `${accentColor}25`,
                    borderColor: `${accentColor}60`,
                    color: accentColor,
                    boxShadow: `0 0 20px ${accentColor}50`,
                  }}
                >
                  <Globe className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-purple-400">
                    CHATOX AI &bull; Initial Setup (v0.8.2)
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Choose Your Language
                  </h2>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Welcome to CHATOX AI! Please select your preferred interface language to begin. You can change this at any time in Settings.
              </p>

              {/* Language Cards */}
              <div className="space-y-2.5">
                {languages.map((lang) => {
                  const isSelected = selectedLanguage === lang.id;
                  return (
                    <div
                      key={lang.id}
                      onClick={() => handleLanguageSelect(lang.id)}
                      className="p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3"
                      style={
                        isSelected
                          ? {
                              backgroundColor: `${accentColor}25`,
                              borderColor: `${accentColor}80`,
                              boxShadow: `0 0 25px ${accentColor}30`,
                            }
                          : {
                              backgroundColor: 'rgba(0, 0, 0, 0.4)',
                              borderColor: 'rgba(255, 255, 255, 0.08)',
                            }
                      }
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{lang.label}</h4>
                          <p className="text-[11px] text-neutral-400">{lang.subLabel}</p>
                        </div>
                      </div>

                      <div
                        className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0"
                        style={{
                          borderColor: isSelected ? accentColor : 'rgba(255, 255, 255, 0.3)',
                          backgroundColor: isSelected ? accentColor : 'transparent',
                        }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  id="welcome-language-next-btn"
                  type="button"
                  onClick={handleContinueToName}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all border rounded-xl shadow-lg active:scale-95 w-full sm:w-auto justify-center"
                  style={{
                    backgroundColor: accentColor,
                    borderColor: `${accentColor}80`,
                    color: getContrastColor(accentColor),
                    boxShadow: `0 0 25px ${accentColor}80`,
                  }}
                >
                  <span>{t.continueBtn}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </motion.div>
          ) : (
            /* STEP 2: NAME INPUT */
            <motion.div
              key="step-name"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-12 h-12 border rounded-2xl shrink-0"
                  style={{
                    backgroundColor: `${accentColor}25`,
                    borderColor: `${accentColor}60`,
                    color: accentColor,
                    boxShadow: `0 0 20px ${accentColor}50`,
                  }}
                >
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-purple-400">
                    CHATOX AI &bull; {t.welcomeSubtitle}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {t.enterYourName}
                  </h2>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {t.nameNotice}
              </p>

              <form onSubmit={handleSubmitName} className="space-y-5">
                <div className="relative">
                  <input
                    id="welcome-name-input"
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder={t.nameInputPlaceholder}
                    autoFocus
                    className="w-full px-4 py-3.5 bg-black/60 border border-purple-500/40 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition-all text-base"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    id="welcome-back-to-lang-btn"
                    type="button"
                    onClick={() => setStep('language')}
                    className="px-4 py-3 text-xs sm:text-sm font-medium transition-colors border rounded-xl text-neutral-400 border-white/10 hover:bg-white/5 hover:text-neutral-200"
                  >
                    ← {t.chooseLanguage}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      id="welcome-skip-btn"
                      type="button"
                      onClick={() => onSkip(selectedLanguage)}
                      className="px-4 py-3 text-xs sm:text-sm font-medium transition-colors border rounded-xl text-neutral-400 border-white/10 hover:bg-white/5 hover:text-neutral-200"
                    >
                      {t.skip}
                    </button>

                    <button
                      id="welcome-confirm-btn"
                      type="submit"
                      className="flex items-center gap-2 px-5 sm:px-6 py-3 text-xs sm:text-sm font-medium transition-all border rounded-xl shadow-lg active:scale-95"
                      style={{
                        backgroundColor: accentColor,
                        borderColor: `${accentColor}80`,
                        color: getContrastColor(accentColor),
                        boxShadow: `0 0 25px ${accentColor}80`,
                      }}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{t.startSession}</span>
                      <ArrowRight className="w-4 h-4 ml-0.5" />
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
