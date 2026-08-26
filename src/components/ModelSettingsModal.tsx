import React, { useState, useEffect } from 'react';
import { X, Settings, RotateCcw, Check, Sparkles, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ModelOption, ModelCustomConfig, AppLanguage } from '../types';
import { getContrastColor } from '../utils/color';
import { getTranslation } from '../i18n/translations';

interface ModelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: ModelOption | null;
  config: ModelCustomConfig | undefined;
  onSaveConfig: (modelId: string, newConfig: ModelCustomConfig) => void;
  accentColor?: string;
  language?: AppLanguage;
}

export const ModelSettingsModal: React.FC<ModelSettingsModalProps> = ({
  isOpen,
  onClose,
  model,
  config,
  onSaveConfig,
  accentColor = '#8a2be2',
  language = 'ru',
}) => {
  const t = getTranslation(language);
  const [displayName, setDisplayName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(4096);
  const [topP, setTopP] = useState<number>(0.95);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (model) {
      setDisplayName(config?.customDisplayName || model.name);
      setSystemPrompt(config?.systemPrompt || '');
      setTemperature(config?.temperature !== undefined ? config.temperature : 0.7);
      setMaxTokens(config?.maxTokens !== undefined ? config.maxTokens : 4096);
      setTopP(config?.topP !== undefined ? config.topP : 0.95);
      setIsSaved(false);
    }
  }, [model, config, isOpen]);

  if (!isOpen || !model) return null;

  const handleSave = () => {
    const updated: ModelCustomConfig = {
      customDisplayName: displayName.trim() || undefined,
      systemPrompt: systemPrompt.trim() || undefined,
      temperature,
      maxTokens,
      topP,
    };
    onSaveConfig(model.id, updated);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  const handleReset = () => {
    setDisplayName(model.name);
    setSystemPrompt('');
    setTemperature(0.7);
    setMaxTokens(4096);
    setTopP(0.95);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl overflow-hidden border rounded-3xl shadow-[0_0_60px_rgba(138,43,226,0.35)] text-neutral-100 p-6 flex flex-col max-h-[90vh]"
          style={{
            backgroundColor: 'var(--panel-bg)',
            borderColor: `${accentColor}50`,
            boxShadow: `0 0 80px ${accentColor}30`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 border rounded-2xl bg-purple-950/60 border-purple-500/40 text-purple-300">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{t.modelParamsTitle}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/60 border border-purple-500/30 text-purple-300">
                    {model.providerName}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">{model.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 text-neutral-400 transition-colors border rounded-xl border-white/10 hover:bg-white/10 hover:text-white"
              title={t.doneClose}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Scroll Body */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[60vh] scrollbar-thin">
            {/* Display Name / Rename */}
            <div className="p-4 border rounded-2xl bg-black/40 border-white/10 space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300">
                {t.displayNameLabel}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={model.name}
                className="w-full px-3.5 py-2 bg-black/60 border border-purple-500/30 rounded-xl text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* Individual System Prompt */}
            <div className="p-4 border rounded-2xl bg-purple-950/20 border-purple-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold tracking-wider uppercase text-purple-300">
                  {t.systemPromptLabel}
                </label>
                <span className="text-[10px] text-purple-400">{t.systemPromptBadge}</span>
              </div>
              <textarea
                rows={3}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder={t.systemPromptPlaceholder}
                className="w-full px-3.5 py-2.5 bg-black/60 border border-purple-500/30 rounded-xl text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* Temperature Slider */}
            <div className="p-4 border rounded-2xl bg-black/40 border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-200">
                    {t.temperatureLabel}
                  </span>
                  <p className="text-[11px] text-neutral-400">
                    {t.temperatureDesc}
                  </p>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300">
                  {temperature.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={2}
                step={0.05}
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
              />
            </div>

            {/* Max Tokens */}
            <div className="p-4 border rounded-2xl bg-black/40 border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-200">
                    {t.maxTokensLabel}
                  </span>
                  <p className="text-[11px] text-neutral-400">
                    256 — 16384 tokens
                  </p>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300">
                  {maxTokens}
                </span>
              </div>
              <input
                type="range"
                min={256}
                max={16384}
                step={256}
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              />
            </div>

            {/* Top-P Slider */}
            <div className="p-4 border rounded-2xl bg-black/40 border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-200">{t.topPLabel}</span>
                  <p className="text-[11px] text-neutral-400">
                    0.10 — 1.00
                  </p>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300">
                  {topP.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={topP}
                onChange={(e) => setTopP(parseFloat(e.target.value))}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetDefaults}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white rounded-xl transition-colors"
              >
                {t.doneClose}
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl shadow-lg transition-all border"
                style={{
                  backgroundColor: accentColor,
                  borderColor: `${accentColor}80`,
                  color: getContrastColor(accentColor),
                  boxShadow: `0 0 20px ${accentColor}70`,
                }}
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                <span>{isSaved ? t.saved : t.saveParameters}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
