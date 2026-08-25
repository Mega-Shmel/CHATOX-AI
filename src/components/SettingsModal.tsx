import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Cpu,
  Shield,
  Palette,
  Eye,
  Search,
  Plus,
  Trash2,
  Edit2,
  Check,
  FolderOpen,
  KeyRound,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  Info,
  CheckCircle2,
  Settings as SettingsIcon,
  Server,
  Terminal,
  Radio,
  Smartphone,
  Monitor,
  Copy,
  FileCode,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AppSettings,
  ProviderId,
  ModelOption,
  CustomModelItem,
  LocalPortConfig,
} from '../types';
import {
  PROVIDERS_LIST,
  PRESET_THEME_COLORS,
  PRESET_ACCENT_COLORS,
  PRESET_FONTS,
} from '../data/defaultModels';
import { getContrastColor, isLightColor } from '../utils/color';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenHuggingFace: () => void;
  onOpenCustomModel: () => void;
  onOpenModelSettings: (model: ModelOption) => void;
  onDiscoverModels: () => Promise<void>;
  isDiscovering: boolean;
  discoverResults?: Record<string, string>;
  shakeTab2?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenHuggingFace,
  onOpenCustomModel,
  onOpenModelSettings,
  onDiscoverModels,
  isDiscovering,
  discoverResults,
  shakeTab2,
}) => {
  const [activeTab, setActiveTab] = useState<'models' | 'security' | 'customization'>('models');
  const [visibleKeyProvider, setVisibleKeyProvider] = useState<ProviderId | null>(null);
  const [editingCustomModelId, setEditingCustomModelId] = useState<string | null>(null);
  const [editingCustomModelName, setEditingCustomModelName] = useState('');
  const [passwordEyeActive, setPasswordEyeActive] = useState(false);
  const [securityPassword, setSecurityPassword] = useState(
    settings.security.rawPasswordForSession || ''
  );
  const [customPrimaryHex, setCustomPrimaryHex] = useState(settings.customization.primaryColor);
  const [customAccentHex, setCustomAccentHex] = useState(settings.customization.accentColor);
  const [isDiscoveringPort, setIsDiscoveringPort] = useState(false);
  const [portStatus, setPortStatus] = useState<string | null>(null);
  const fontInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (shakeTab2) {
      setActiveTab('security');
    }
  }, [shakeTab2]);

  if (!isOpen) return null;

  // Toggle eye visibility for exactly 0.5s as requested
  const handlePasswordEyeClick = () => {
    setPasswordEyeActive(true);
    setTimeout(() => {
      setPasswordEyeActive(false);
    }, 500);
  };

  const handleApiKeyChange = (provider: ProviderId, val: string) => {
    const updated = { ...settings.apiKeys, [provider]: val };
    onUpdateSettings({ apiKeys: updated });
  };

  const handleToggleModel = (modelId: string) => {
    const currentEnabled = new Set(settings.enabledModelIds);
    if (currentEnabled.has(modelId)) {
      currentEnabled.delete(modelId);
    } else {
      currentEnabled.add(modelId);
    }
    onUpdateSettings({ enabledModelIds: Array.from(currentEnabled) });
  };

  const handleSaveCustomModelName = (id: string) => {
    if (!editingCustomModelName.trim()) return;
    const updated = settings.customModels.map((m) =>
      m.id === id ? { ...m, name: editingCustomModelName.trim() } : m
    );
    onUpdateSettings({ customModels: updated });
    setEditingCustomModelId(null);
  };

  const handleDeleteCustomModel = (id: string) => {
    const updated = settings.customModels.filter((m) => m.id !== id);
    onUpdateSettings({ customModels: updated });
  };

  const handleDiscoverPortModels = async () => {
    const portCfg = settings.localPortConfig || {
      enabled: true,
      host: '127.0.0.1',
      port: 11434,
      serverType: 'ollama',
    };

    setIsDiscoveringPort(true);
    setPortStatus('Подключение к локальному серверу...');

    try {
      const res = await fetch('/api/models/local-discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: portCfg.host || '127.0.0.1',
          port: portCfg.port || 11434,
          serverType: portCfg.serverType || 'ollama',
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.models)) {
        setPortStatus(data.status || `Найдено ${data.models.length} моделей`);
        const newDiscovered = data.models.map((m: string) => ({
          id: `local/${m}`,
          name: m,
        }));
        onUpdateSettings({
          localPortConfig: {
            ...portCfg,
            discoveredModels: newDiscovered,
          },
        });
      } else {
        setPortStatus(data.error || 'Локальный порт недоступен');
      }
    } catch (e: any) {
      setPortStatus(`Ошибка соединения: ${e.message}`);
    } finally {
      setIsDiscoveringPort(false);
    }
  };

  const handleCustomFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const fontName = file.name.replace(/\.[^/.]+$/, '');
      const newStyle = document.createElement('style');
      newStyle.appendChild(
        document.createTextNode(`
        @font-face {
          font-family: '${fontName}';
          src: url('${url}');
        }
      `)
      );
      document.head.appendChild(newStyle);

      onUpdateSettings({
        customization: {
          ...settings.customization,
          fontFamily: `'${fontName}', sans-serif`,
          fontName: `Свой шрифт (${file.name})`,
          customFontUrl: url,
        },
      });
    }
  };

  const localPortConfig = settings.localPortConfig || {
    enabled: false,
    host: '127.0.0.1',
    port: 11434,
    serverType: 'ollama',
    discoveredModels: [],
  };

  const primaryColor = settings.customization.primaryColor || '#8a2be2';
  const accentColor = settings.customization.accentColor || '#9333ea';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-5xl h-[88vh] flex flex-col md:flex-row overflow-hidden border rounded-3xl text-neutral-100 shadow-2xl"
          style={{
            backgroundColor: 'var(--panel-bg)',
            borderColor: `${accentColor}50`,
            boxShadow: `0 0 80px ${accentColor}30`,
          }}
        >
          {/* Sidebar / Top Tabs navigation */}
          <div
            className="w-full md:w-60 border-b md:border-b-0 md:border-r border-white/10 p-3 sm:p-4 md:p-5 flex flex-col md:justify-between shrink-0"
            style={{ backgroundColor: 'var(--panel-card-bg)' }}
          >
            <div>
              <div className="flex items-center justify-between md:justify-start gap-2.5 mb-3 md:mb-6 px-1 md:px-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-xl border shrink-0"
                    style={{
                      backgroundColor: `${accentColor}25`,
                      borderColor: `${accentColor}50`,
                      color: accentColor,
                    }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm sm:text-base font-bold tracking-wide text-white">CHATOX Настройки</h2>
                </div>
                {/* Mobile close button in tab bar */}
                <button
                  onClick={onClose}
                  className="flex md:hidden items-center justify-center w-8 h-8 text-neutral-400 border rounded-xl border-white/10 hover:bg-white/10 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Responsive Tabs: Horizontal scroll on mobile/tablet, vertical stack on desktop */}
              <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                <button
                  id="tab-btn-models"
                  onClick={() => setActiveTab('models')}
                  className="flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-3.5 py-2.5 md:py-3 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all border shrink-0"
                  style={
                    activeTab === 'models'
                      ? {
                          backgroundColor: accentColor,
                          borderColor: `${accentColor}80`,
                          color: getContrastColor(accentColor),
                          boxShadow: `0 0 20px ${accentColor}60`,
                        }
                      : {
                          backgroundColor: 'transparent',
                          borderColor: 'transparent',
                          color: '#a3a3a3',
                        }
                  }
                >
                  <Cpu className="w-4 h-4 shrink-0" />
                  <span>ИИ-модели</span>
                </button>

                <motion.button
                  id="tab-btn-security"
                  animate={
                    shakeTab2
                      ? { x: [-10, 10, -8, 8, -4, 4, 0], backgroundColor: 'rgba(239, 68, 68, 0.3)' }
                      : {}
                  }
                  transition={{ duration: 0.5 }}
                  onClick={() => setActiveTab('security')}
                  className="flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-3.5 py-2.5 md:py-3 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all border shrink-0"
                  style={
                    activeTab === 'security'
                      ? {
                          backgroundColor: accentColor,
                          borderColor: `${accentColor}80`,
                          color: getContrastColor(accentColor),
                          boxShadow: `0 0 20px ${accentColor}60`,
                        }
                      : {
                          backgroundColor: 'transparent',
                          borderColor: 'transparent',
                          color: '#a3a3a3',
                        }
                  }
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  <span>Безопасность</span>
                </motion.button>

                <button
                  id="tab-btn-customization"
                  onClick={() => setActiveTab('customization')}
                  className="flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-3.5 py-2.5 md:py-3 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all border shrink-0"
                  style={
                    activeTab === 'customization'
                      ? {
                          backgroundColor: accentColor,
                          borderColor: `${accentColor}80`,
                          color: getContrastColor(accentColor),
                          boxShadow: `0 0 20px ${accentColor}60`,
                        }
                      : {
                          backgroundColor: 'transparent',
                          borderColor: 'transparent',
                          color: '#a3a3a3',
                        }
                  }
                >
                  <Palette className="w-4 h-4 shrink-0" />
                  <span>Кастомизация</span>
                </button>
              </div>
            </div>

            <div className="hidden md:block pt-4 border-t border-white/10">
              <button
                id="settings-close-bottom-btn"
                onClick={onClose}
                className="w-full py-2.5 px-4 text-xs font-semibold text-neutral-300 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
              >
                Готово / Закрыть
              </button>
            </div>
          </div>

          {/* Main Tab Content */}
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#07060f]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3.5 sm:py-5 border-b border-white/10 bg-black/20">
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-white">
                  {activeTab === 'models' && 'Конфигурация ИИ-моделей'}
                  {activeTab === 'security' && 'Безопасность и защита данных'}
                  {activeTab === 'customization' && 'Кастомизация интерфейса'}
                </h3>
                <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">
                  {activeTab === 'models' && 'Управление API-ключами, выбор активных моделей, индивидуальные параметры (⚙️)'}
                  {activeTab === 'security' && 'Сквозное шифрование AES-256-GCM и защита от переноса'}
                  {activeTab === 'customization' && 'Палитра тем, кастомные цвета, шрифты и простые названия'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="hidden md:flex items-center justify-center w-9 h-9 text-neutral-400 transition-colors border rounded-xl border-white/10 hover:bg-white/10 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable tab body */}
            <div className="flex-1 p-3.5 sm:p-6 md:p-8 overflow-y-auto space-y-6 sm:space-y-8 scrollbar-thin">
              {/* TAB 1: ИИ-МОДЕЛИ */}
              {activeTab === 'models' && (
                <div className="space-y-8">
                  {/* System Prompt */}
                  <div
                    className="p-5 border rounded-2xl"
                    style={{
                      backgroundColor: `${accentColor}12`,
                      borderColor: `${accentColor}40`,
                    }}
                  >
                    <label
                      className="block mb-2 text-xs font-bold tracking-wider uppercase"
                      style={{ color: accentColor }}
                    >
                      Общий системный промпт (Инструкция поведения ИИ)
                    </label>
                    <textarea
                      id="system-prompt-input"
                      rows={3}
                      value={settings.systemPrompt}
                      onChange={(e) => onUpdateSettings({ systemPrompt: e.target.value })}
                      placeholder="Опишите характер, язык, стиль и поведение нейросети для всех запросов..."
                      className="w-full px-4 py-3 bg-black/60 border rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none transition-all"
                      style={{ borderColor: `${accentColor}40` }}
                    />
                    <span className="text-[11px] text-neutral-400 mt-1.5 block">
                      💡 Для каждой конкретной модели можно задать индивидуальный системный промпт и температуру через значок шестерёнки (⚙️) рядом с чекбоксом.
                    </span>
                  </div>

                  {/* Context limits & discovery */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-xl bg-black/40 border-white/10">
                      <label className="block mb-1 text-xs font-medium text-neutral-300">
                        Макс. сообщений в контексте
                      </label>
                      <input
                        type="number"
                        min={2}
                        max={100}
                        value={settings.maxMessagesInContext}
                        onChange={(e) =>
                          onUpdateSettings({
                            maxMessagesInContext: parseInt(e.target.value) || 20,
                          })
                        }
                        className="w-full px-3 py-2 bg-black/70 border border-white/10 rounded-lg text-white text-sm"
                      />
                      <span className="text-[11px] text-neutral-500 mt-1 block">
                        По умолчанию: 20 сообщений
                      </span>
                    </div>

                    <div className="p-4 border rounded-xl bg-black/40 border-white/10">
                      <label className="block mb-1 text-xs font-medium text-neutral-300">
                        Количество сохраняемых чатов
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={settings.maxSavedChats}
                        onChange={(e) =>
                          onUpdateSettings({
                            maxSavedChats: parseInt(e.target.value) || 5,
                          })
                        }
                        className="w-full px-3 py-2 bg-black/70 border border-white/10 rounded-lg text-white text-sm"
                      />
                      <span className="text-[11px] text-neutral-500 mt-1 block">
                        По умолчанию: 5 чатов в зашифрованных файлах
                      </span>
                    </div>
                  </div>

                  {/* Auto discover toggle + Search button */}
                  <div className="p-4 border rounded-2xl bg-black/40 border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.autoDiscoverModels}
                          onChange={(e) =>
                            onUpdateSettings({ autoDiscoverModels: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div
                          className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                          style={
                            settings.autoDiscoverModels
                              ? {
                                  backgroundColor: accentColor,
                                  boxShadow: `0 0 15px ${accentColor}60`,
                                }
                              : {}
                          }
                        />
                      </label>
                      <div>
                        <span className="text-sm font-semibold text-white">
                          Поиск ИИ моделей (немного тратит лимит API-ключей)
                        </span>
                        <p className="text-xs text-neutral-400">
                          Автоматическая проверка и динамическое получение доступных моделей по ключам
                        </p>
                      </div>
                    </div>

                    {settings.autoDiscoverModels && (
                      <button
                        onClick={onDiscoverModels}
                        disabled={isDiscovering}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl shadow-lg disabled:opacity-50 transition-all border"
                        style={{
                          backgroundColor: accentColor,
                          borderColor: `${accentColor}80`,
                          color: getContrastColor(accentColor),
                          boxShadow: `0 0 20px ${accentColor}60`,
                        }}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isDiscovering ? 'animate-spin' : ''}`} />
                        <span>{isDiscovering ? 'Проверка...' : 'Поиск моделей'}</span>
                      </button>
                    )}
                  </div>

                  {/* External Model Actions */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={onOpenHuggingFace}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all border shadow-sm"
                      style={{
                        backgroundColor: `${accentColor}18`,
                        borderColor: `${accentColor}50`,
                        color: isLightColor(accentColor) ? '#ffffff' : accentColor,
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Добавить модель из Hugging Face</span>
                    </button>

                    <button
                      onClick={onOpenCustomModel}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-neutral-200 border border-white/10 bg-black/40 hover:bg-white/5 rounded-xl transition-all"
                    >
                      <FolderOpen className="w-4 h-4" style={{ color: accentColor }} />
                      <span>Добавить свою модель (GGUF, ONNX)</span>
                    </button>
                  </div>

                  {/* SECTION: Local Port Connection (Isolated & Distinct) */}
                  <div
                    className="p-5 border rounded-2xl bg-black/50 space-y-4"
                    style={{
                      borderColor: localPortConfig.enabled ? `${accentColor}70` : 'rgba(255, 255, 255, 0.1)',
                      boxShadow: localPortConfig.enabled ? `0 0 30px ${accentColor}25` : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center justify-center w-9 h-9 rounded-xl border"
                          style={{
                            backgroundColor: `${accentColor}20`,
                            borderColor: `${accentColor}50`,
                            color: accentColor,
                          }}
                        >
                          <Server className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            Подключение по локальному порту
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full border font-mono"
                              style={{
                                backgroundColor: `${accentColor}20`,
                                borderColor: `${accentColor}40`,
                                color: accentColor,
                              }}
                            >
                              Ollama / LM Studio / vLLM
                            </span>
                          </h4>
                          <p className="text-xs text-neutral-400">
                            Отдельный переключатель и обнаружение локально запущенных моделей
                          </p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localPortConfig.enabled}
                          onChange={(e) =>
                            onUpdateSettings({
                              localPortConfig: {
                                ...localPortConfig,
                                enabled: e.target.checked,
                              },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div
                          className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                          style={
                            localPortConfig.enabled
                              ? {
                                  backgroundColor: accentColor,
                                  boxShadow: `0 0 15px ${accentColor}60`,
                                }
                              : {}
                          }
                        />
                      </label>
                    </div>

                    {localPortConfig.enabled && (
                      <div className="pt-3 border-t border-white/10 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block mb-1 text-[11px] text-neutral-400 font-medium">
                              Хост (IP)
                            </label>
                            <input
                              type="text"
                              value={localPortConfig.host || '127.0.0.1'}
                              onChange={(e) =>
                                onUpdateSettings({
                                  localPortConfig: {
                                    ...localPortConfig,
                                    host: e.target.value,
                                  },
                                })
                              }
                              placeholder="127.0.0.1"
                              className="w-full px-3 py-2 bg-black/70 border rounded-xl text-white font-mono text-xs focus:outline-none"
                              style={{ borderColor: `${accentColor}40` }}
                            />
                          </div>

                          <div>
                            <label className="block mb-1 text-[11px] text-neutral-400 font-medium">
                              Порт
                            </label>
                            <input
                              type="number"
                              value={localPortConfig.port || 11434}
                              onChange={(e) =>
                                onUpdateSettings({
                                  localPortConfig: {
                                    ...localPortConfig,
                                    port: parseInt(e.target.value) || 11434,
                                  },
                                })
                              }
                              placeholder="11434"
                              className="w-full px-3 py-2 bg-black/70 border rounded-xl text-white font-mono text-xs focus:outline-none"
                              style={{ borderColor: `${accentColor}40` }}
                            />
                          </div>

                          <div>
                            <label className="block mb-1 text-[11px] text-neutral-400 font-medium">
                              Тип сервера
                            </label>
                            <select
                              value={localPortConfig.serverType || 'ollama'}
                              onChange={(e) =>
                                onUpdateSettings({
                                  localPortConfig: {
                                    ...localPortConfig,
                                    serverType: e.target.value as any,
                                  },
                                })
                              }
                              className="w-full px-3 py-2 bg-black/70 border rounded-xl text-white text-xs focus:outline-none"
                              style={{ borderColor: `${accentColor}40` }}
                            >
                              <option value="ollama">Ollama (11434)</option>
                              <option value="openai-compatible">LM Studio / vLLM (1234 / 8000)</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={handleDiscoverPortModels}
                            disabled={isDiscoveringPort}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl shadow-lg disabled:opacity-50 transition-all border"
                            style={{
                              backgroundColor: accentColor,
                              borderColor: `${accentColor}80`,
                              color: getContrastColor(accentColor),
                              boxShadow: `0 0 15px ${accentColor}50`,
                            }}
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isDiscoveringPort ? 'animate-spin' : ''}`} />
                            <span>{isDiscoveringPort ? 'Подключение...' : 'Обнаружить модели на порту'}</span>
                          </button>

                          {portStatus && (
                            <span className="text-xs font-mono font-medium" style={{ color: accentColor }}>
                              {portStatus}
                            </span>
                          )}
                        </div>

                        {/* Discovered Port Models */}
                        {localPortConfig.discoveredModels && localPortConfig.discoveredModels.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <span className="text-[11px] text-neutral-400 font-medium block">
                              Обнаруженные на порту модели:
                            </span>
                            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                              {localPortConfig.discoveredModels.map((m) => {
                                const isChecked = settings.enabledModelIds.includes(m.id);
                                return (
                                  <div
                                    key={`port-model-${m.id}`}
                                    className="flex items-center justify-between p-3 rounded-xl border shrink-0 w-64 transition-all"
                                    style={
                                      isChecked
                                        ? {
                                            backgroundColor: `${accentColor}25`,
                                            borderColor: `${accentColor}70`,
                                            boxShadow: `0 0 15px ${accentColor}30`,
                                          }
                                        : {
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                            borderColor: 'rgba(255, 255, 255, 0.05)',
                                            opacity: 0.75,
                                          }
                                    }
                                  >
                                    <label className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleToggleModel(m.id)}
                                        className="w-4 h-4 rounded bg-black"
                                        style={{ accentColor }}
                                      />
                                      <span className="text-xs font-semibold text-white truncate">
                                        {m.name}
                                      </span>
                                    </label>
                                    <button
                                      onClick={() =>
                                        onOpenModelSettings({
                                          id: m.id,
                                          name: m.name,
                                          simpleName: m.name,
                                          provider: 'custom',
                                          providerName: 'Локальный порт',
                                          simpleProviderName: 'Локальный',
                                          description: 'Модель с локального сервера',
                                          enabled: true,
                                        })
                                      }
                                      className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors ml-2"
                                      title="Индивидуальные настройки модели"
                                    >
                                      <SettingsIcon className="w-4 h-4" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Copy models to AppData toggle */}
                  <div className="flex items-center justify-between p-4 border rounded-xl bg-black/30 border-white/5">
                    <span className="text-xs font-medium text-neutral-300">
                      Копировать выбранные модели на устройство в AppData
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.copyModelsToAppData}
                        onChange={(e) =>
                          onUpdateSettings({ copyModelsToAppData: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div
                        className="w-10 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"
                        style={
                          settings.copyModelsToAppData
                            ? {
                                backgroundColor: accentColor,
                              }
                            : {}
                        }
                      />
                    </label>
                  </div>

                  {/* SECTION: Custom Added Models List (Renaming and Management) */}
                  {settings.customModels.length > 0 && (
                    <div
                      className="p-5 border rounded-2xl space-y-3"
                      style={{
                        backgroundColor: `${accentColor}10`,
                        borderColor: `${accentColor}40`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <h4
                          className="text-xs font-bold uppercase tracking-wider"
                          style={{ color: accentColor }}
                        >
                          Добавленные файлы моделей (Переименование)
                        </h4>
                        <span className="text-[11px] text-neutral-400">
                          {settings.customModels.length} шт.
                        </span>
                      </div>

                      <div className="space-y-2">
                        {settings.customModels.map((cm) => {
                          const isChecked = settings.enabledModelIds.includes(cm.id);
                          return (
                            <div
                              key={`custom-file-${cm.id}`}
                              className="flex items-center justify-between p-3 border rounded-xl bg-black/60 border-white/10 hover:border-white/20 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1 mr-3 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleModel(cm.id)}
                                  className="w-4 h-4 rounded bg-black"
                                  style={{ accentColor }}
                                />

                                {editingCustomModelId === cm.id ? (
                                  <div className="flex items-center gap-1.5 flex-1">
                                    <input
                                      type="text"
                                      value={editingCustomModelName}
                                      onChange={(e) => setEditingCustomModelName(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveCustomModelName(cm.id);
                                        if (e.key === 'Escape') setEditingCustomModelId(null);
                                      }}
                                      placeholder="Новое имя модели..."
                                      className="px-2.5 py-1 text-xs bg-black border rounded text-white flex-1 focus:outline-none"
                                      style={{ borderColor: accentColor }}
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleSaveCustomModelName(cm.id)}
                                      className="p-1 text-emerald-400 hover:text-emerald-300"
                                      title="Сохранить имя"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span
                                      onClick={() => {
                                        setEditingCustomModelId(cm.id);
                                        setEditingCustomModelName(cm.name);
                                      }}
                                      className="text-xs text-white font-medium cursor-pointer flex items-center gap-1.5 truncate hover:underline"
                                      title="Нажмите для переименования модели"
                                    >
                                      {cm.name}
                                      <Edit2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                    </span>
                                    <span
                                      className="text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0"
                                      style={{
                                        backgroundColor: `${accentColor}20`,
                                        borderColor: `${accentColor}40`,
                                        color: accentColor,
                                      }}
                                    >
                                      {cm.format || 'Local'}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() =>
                                    onOpenModelSettings({
                                      id: cm.id,
                                      name: cm.name,
                                      simpleName: cm.name,
                                      provider: 'custom',
                                      providerName: 'Пользовательская',
                                      simpleProviderName: 'Своя',
                                      description: `Пользовательская модель (${cm.format || 'Local'})`,
                                      enabled: true,
                                      isCustom: true,
                                    })
                                  }
                                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors"
                                  title="Настройки параметров модели"
                                >
                                  <SettingsIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCustomModel(cm.id)}
                                  className="text-neutral-500 hover:text-red-400 p-1.5 transition-colors"
                                  title="Удалить модель"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Provider API Keys & Model selection */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Провайдеры ИИ и Выбор Активных Моделей
                    </h4>

                    {PROVIDERS_LIST.map((provider) => {
                      const currentKey = settings.apiKeys[provider.id] || '';
                      const isKeyVisible = visibleKeyProvider === provider.id;
                      const rawDiscovered = settings.discoveredModels?.[provider.id] || [];
                      const defaultIds = new Set(provider.defaultModels.map((dm) => dm.id));
                      // Exclude models that already exist in default models and ensure uniqueness by ID
                      const seenDiscoveredIds = new Set<string>();
                      const discoveredForProvider = rawDiscovered.filter((m) => {
                        if (defaultIds.has(m.id)) return false;
                        if (seenDiscoveredIds.has(m.id)) return false;
                        seenDiscoveredIds.add(m.id);
                        return true;
                      });

                      return (
                        <div
                          key={`provider-${provider.id}`}
                          className="p-5 border rounded-2xl bg-black/40 border-white/10 hover:border-white/20 transition-colors space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">
                                {settings.customization.useSimpleNames
                                  ? provider.simpleName
                                  : provider.name}
                              </span>
                              <span
                                className="text-[10px] px-2 py-0.5 rounded-full border"
                                style={{
                                  backgroundColor: `${accentColor}20`,
                                  borderColor: `${accentColor}40`,
                                  color: accentColor,
                                }}
                              >
                                {provider.badge}
                              </span>
                            </div>
                            {provider.id === 'google' && (
                              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Встроенный ключ сервера</span>
                              </span>
                            )}
                          </div>

                          {/* API key input */}
                          <div className="relative">
                            <input
                              type={isKeyVisible ? 'text' : 'password'}
                              value={currentKey}
                              onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                              placeholder={`Введите API ключ для ${
                                settings.customization.useSimpleNames
                                  ? provider.simpleName
                                  : provider.name
                              }...`}
                              className="w-full px-3.5 py-2.5 pr-10 bg-black/60 border rounded-xl text-white font-mono text-xs focus:outline-none transition-colors"
                              style={{ borderColor: currentKey ? `${accentColor}60` : 'rgba(255, 255, 255, 0.1)' }}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setVisibleKeyProvider(isKeyVisible ? null : provider.id)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Built-in default model list */}
                          <div className="space-y-2 pt-2">
                            <span className="text-[11px] text-neutral-400 font-medium block">
                              Предустановленные модели:
                            </span>
                            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                              {provider.defaultModels.map((model) => {
                                const isChecked = settings.enabledModelIds.includes(model.id);
                                return (
                                  <div
                                    key={`default-${provider.id}-${model.id}`}
                                    className="flex items-start justify-between p-3 rounded-xl border shrink-0 w-64 transition-all"
                                    style={
                                      isChecked
                                        ? {
                                            backgroundColor: `${accentColor}20`,
                                            borderColor: `${accentColor}60`,
                                            boxShadow: `0 0 15px ${accentColor}20`,
                                          }
                                        : {
                                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                            borderColor: 'rgba(255, 255, 255, 0.05)',
                                            opacity: 0.8,
                                          }
                                    }
                                  >
                                    <label className="flex items-start gap-2.5 min-w-0 flex-1 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleToggleModel(model.id)}
                                        className="w-4 h-4 mt-0.5 rounded bg-black"
                                        style={{ accentColor }}
                                      />
                                      <div className="min-w-0">
                                        <div className="text-xs font-semibold text-white truncate">
                                          {settings.customization.useSimpleNames
                                            ? model.simpleName
                                            : model.name}
                                        </div>
                                        <div className="text-[10px] text-neutral-400 line-clamp-2 mt-0.5">
                                          {model.description}
                                        </div>
                                      </div>
                                    </label>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onOpenModelSettings(model);
                                      }}
                                      className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors ml-1.5"
                                      title="Настройки системного промпта и параметров модели"
                                    >
                                      <SettingsIcon className="w-4 h-4" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Dynamic Discovered Models (Just model name, without description) */}
                          {discoveredForProvider.length > 0 && (
                            <div className="pt-2 border-t border-white/5 space-y-2">
                              <span className="text-[11px] font-medium block" style={{ color: accentColor }}>
                                Обнаруженные через API модели (названия без описания):
                              </span>
                              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                                {discoveredForProvider.map((m) => {
                                  const isChecked = settings.enabledModelIds.includes(m.id);
                                  return (
                                    <div
                                      key={`discovered-${provider.id}-${m.id}`}
                                      className="flex items-center justify-between p-2.5 rounded-xl border shrink-0 min-w-[180px] max-w-[240px] transition-all"
                                      style={
                                        isChecked
                                          ? {
                                              backgroundColor: `${accentColor}25`,
                                              borderColor: `${accentColor}60`,
                                            }
                                          : {
                                              backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                              borderColor: 'rgba(255, 255, 255, 0.05)',
                                              opacity: 0.7,
                                            }
                                      }
                                    >
                                      <label className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => handleToggleModel(m.id)}
                                          className="w-3.5 h-3.5 rounded bg-black"
                                          style={{ accentColor }}
                                        />
                                        <span className="text-xs font-semibold text-white truncate">
                                          {m.name}
                                        </span>
                                      </label>
                                      <button
                                        onClick={() =>
                                          onOpenModelSettings({
                                            id: m.id,
                                            name: m.name,
                                            simpleName: m.name,
                                            provider: provider.id,
                                            providerName: provider.name,
                                            simpleProviderName: provider.simpleName,
                                            description: '',
                                            enabled: true,
                                          })
                                        }
                                        className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors ml-1.5"
                                        title="Настройки параметров модели"
                                      >
                                        <SettingsIcon className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: БЕЗОПАСНОСТЬ */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  {/* File Encryption switch */}
                  <div className="p-5 border rounded-2xl bg-black/40 border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Шифрование файлов</h4>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Сквозное AES-256-GCM шифрование для всех сохраняемых файлов (имя, ключи, чаты)
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.encryptFiles}
                        onChange={(e) =>
                          onUpdateSettings({
                            security: { ...settings.security, encryptFiles: e.target.checked },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div
                        className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                        style={
                          settings.security.encryptFiles
                            ? {
                                backgroundColor: accentColor,
                                boxShadow: `0 0 15px ${accentColor}60`,
                              }
                            : {}
                        }
                      />
                    </label>
                  </div>

                  {/* Transfer Protection switch */}
                  <motion.div
                    animate={
                      shakeTab2
                        ? {
                            x: [-12, 12, -8, 8, -4, 4, 0],
                            borderColor: '#ef4444',
                            boxShadow: '0 0 30px rgba(239,68,68,0.5)',
                          }
                        : {}
                    }
                    transition={{ duration: 0.5 }}
                    className={`p-5 border rounded-2xl bg-black/40 transition-colors space-y-4 ${
                      shakeTab2 ? 'border-red-500 bg-red-950/10' : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">Защита от переноса</h4>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Привязка к аппаратному ID устройства с блокировкой при копировании
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.security.transferProtection}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            onUpdateSettings({
                              security: {
                                ...settings.security,
                                transferProtection: isChecked,
                              },
                            });
                          }}
                          className="sr-only peer"
                        />
                        <div
                          className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                          style={
                            settings.security.transferProtection
                              ? {
                                  backgroundColor: accentColor,
                                  boxShadow: `0 0 15px ${accentColor}60`,
                                }
                              : {}
                          }
                        />
                      </label>
                    </div>

                    {/* Password field revealed when transfer protection is ON */}
                    {settings.security.transferProtection && (
                      <div className="pt-3 border-t border-white/10 space-y-2">
                        <label className="block text-xs font-semibold" style={{ color: accentColor }}>
                          Мастер-пароль разблокировки
                        </label>
                        <div className="relative">
                          <input
                            id="security-password-input"
                            type={passwordEyeActive ? 'text' : 'password'}
                            value={securityPassword}
                            onChange={(e) => {
                              setSecurityPassword(e.target.value);
                              onUpdateSettings({
                                security: {
                                  ...settings.security,
                                  rawPasswordForSession: e.target.value,
                                },
                              });
                            }}
                            placeholder="Введите мастер-пароль..."
                            className="w-full px-4 py-2.5 pr-12 bg-black/80 border rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none"
                            style={{ borderColor: `${accentColor}50` }}
                          />
                          <button
                            type="button"
                            onClick={handlePasswordEyeClick}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors p-1"
                            title="Показать пароль на 0.5 секунды"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[11px] text-neutral-400">
                          При нажатии на значок глаза пароль отображается на 0.5 секунды.
                        </p>
                      </div>
                    )}
                  </motion.div>

                  {/* AppData storage info memo */}
                  <div
                    className="p-4 border rounded-2xl flex items-start gap-3"
                    style={{
                      backgroundColor: `${accentColor}10`,
                      borderColor: `${accentColor}30`,
                    }}
                  >
                    <Info className="w-5 h-5 shrink-0 mt-0.5" style={{ color: accentColor }} />
                    <div className="text-xs text-neutral-300 space-y-1">
                      <p className="font-semibold text-white">
                        Памятка: Хранилище данных AppData / Local Encrypted Vault
                      </p>
                      <p>
                        Все ключи, чаты и настройки сохраняются в изолированном защищенном контейнере.
                        Алгоритм AES-256-GCM с производным ключом через PBKDF2 (100,000 итераций).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: КАСТОМИЗАЦИЯ */}
              {activeTab === 'customization' && (
                <div className="space-y-8">
                  {/* Simple Names switch */}
                  <div className="p-5 border rounded-2xl bg-black/40 border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Простые названия</h4>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Заменять названия компаний на имена самих ИИ («Google» &rarr; «Gemini», «Anthropic» &rarr; «Claude», «xAI» &rarr; «Grok»)
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.customization.useSimpleNames}
                        onChange={(e) =>
                          onUpdateSettings({
                            customization: {
                              ...settings.customization,
                              useSimpleNames: e.target.checked,
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div
                        className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                        style={
                          settings.customization.useSimpleNames
                            ? {
                                backgroundColor: accentColor,
                                boxShadow: `0 0 15px ${accentColor}60`,
                              }
                            : {}
                        }
                      />
                    </label>
                  </div>

                  {/* Background Mode Switch (Old vs New center/edges) */}
                  <div className="p-5 border rounded-2xl bg-black/40 border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Классический фон (старый режим свечения)</h4>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Переключение со старым режимом фона (две зоны) на фокус центра (акцент) и краев (основной)
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.customization.useOldBackground || false}
                        onChange={(e) =>
                          onUpdateSettings({
                            customization: {
                              ...settings.customization,
                              useOldBackground: e.target.checked,
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div
                        className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                        style={
                          settings.customization.useOldBackground
                            ? {
                                backgroundColor: accentColor,
                                boxShadow: `0 0 15px ${accentColor}60`,
                              }
                            : {}
                        }
                      />
                    </label>
                  </div>

                  {/* Glow Opacity Slider (70% Default) */}
                  <div className="p-5 border rounded-2xl bg-black/40 border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">Интенсивность фонового свечения</h4>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Настройка яркости неоновых переливов на заднем плане (от 20% до 100%)
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold" style={{ color: accentColor }}>
                        {Math.round((settings.customization.glowOpacity ?? 0.7) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={1}
                      step={0.05}
                      value={settings.customization.glowOpacity ?? 0.7}
                      onChange={(e) =>
                        onUpdateSettings({
                          customization: {
                            ...settings.customization,
                            glowOpacity: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full"
                    />
                  </div>

                  {/* User Name input */}
                  <div className="p-5 border rounded-2xl bg-black/40 border-white/10">
                    <label
                      className="block mb-2 text-xs font-bold uppercase tracking-wider"
                      style={{ color: accentColor }}
                    >
                      Имя пользователя для приветствия
                    </label>
                    <input
                      type="text"
                      value={
                        settings.customization.userName === 'Skipped'
                          ? ''
                          : settings.customization.userName
                      }
                      onChange={(e) =>
                        onUpdateSettings({
                          customization: {
                            ...settings.customization,
                            userName: e.target.value.trim() ? e.target.value : 'Skipped',
                          },
                        })
                      }
                      placeholder="Оставьте пустым или введите имя (например: Алекс)"
                      className="w-full px-4 py-2.5 bg-black/70 border rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none"
                      style={{ borderColor: `${accentColor}40` }}
                    />
                  </div>

                  {/* Primary Theme Colors: Clean Swatches */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                        Основной цвет темы (Применяется ко всему интерфейсу)
                      </h4>
                      <span className="text-xs font-mono font-bold" style={{ color: accentColor }}>
                        {settings.customization.primaryColor}
                      </span>
                    </div>

                    <div className="grid grid-cols-8 sm:grid-cols-8 md:grid-cols-8 gap-3">
                      {PRESET_THEME_COLORS.map((col) => {
                        const isSelected = settings.customization.primaryColor === col.hex;
                        return (
                          <button
                            key={col.hex}
                            title={col.hex}
                            onClick={() =>
                              onUpdateSettings({
                                customization: {
                                  ...settings.customization,
                                  primaryColor: col.hex,
                                  primaryColorName: col.hex,
                                },
                              })
                            }
                            className={`h-11 rounded-xl border flex items-center justify-center transition-all ${
                              isSelected
                                ? 'scale-110 border-white ring-2 shadow-lg'
                                : 'border-white/20 hover:scale-105 hover:border-white/60'
                            }`}
                            style={{
                              backgroundColor: col.hex,
                              boxShadow: isSelected ? `0 0 20px ${col.hex}` : 'none',
                            }}
                          >
                            {isSelected && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom RGB color */}
                    <div className="flex items-center gap-3 p-3 border rounded-xl bg-black/40 border-white/10">
                      <input
                        type="color"
                        value={customPrimaryHex}
                        onChange={(e) => {
                          setCustomPrimaryHex(e.target.value);
                          onUpdateSettings({
                            customization: {
                              ...settings.customization,
                              primaryColor: e.target.value,
                              primaryColorName: e.target.value,
                            },
                          });
                        }}
                        className="w-9 h-9 rounded-lg border border-white/20 cursor-pointer bg-transparent"
                      />
                      <div>
                        <span className="text-xs font-semibold text-white">Выбрать свой цвет (RGB)</span>
                        <p className="text-[11px] font-mono text-neutral-400">{customPrimaryHex}</p>
                      </div>
                    </div>
                  </div>

                  {/* Accent Theme Colors: Clean Swatches */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                        Акцентный цвет
                      </h4>
                      <span className="text-xs font-mono font-bold" style={{ color: settings.customization.accentColor }}>
                        {settings.customization.accentColor}
                      </span>
                    </div>

                    <div className="grid grid-cols-8 sm:grid-cols-8 md:grid-cols-8 gap-3">
                      {PRESET_ACCENT_COLORS.map((col) => {
                        const isSelected = settings.customization.accentColor === col.hex;
                        return (
                          <button
                            key={col.hex}
                            title={col.hex}
                            onClick={() =>
                              onUpdateSettings({
                                customization: {
                                  ...settings.customization,
                                  accentColor: col.hex,
                                  accentColorName: col.hex,
                                },
                              })
                            }
                            className={`h-11 rounded-xl border flex items-center justify-center transition-all ${
                              isSelected
                                ? 'scale-110 border-white ring-2 shadow-lg'
                                : 'border-white/20 hover:scale-105 hover:border-white/60'
                            }`}
                            style={{
                              backgroundColor: col.hex,
                              boxShadow: isSelected ? `0 0 20px ${col.hex}` : 'none',
                            }}
                          >
                            {isSelected && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom RGB Accent */}
                    <div className="flex items-center gap-3 p-3 border rounded-xl bg-black/40 border-white/10">
                      <input
                        type="color"
                        value={customAccentHex}
                        onChange={(e) => {
                          setCustomAccentHex(e.target.value);
                          onUpdateSettings({
                            customization: {
                              ...settings.customization,
                              accentColor: e.target.value,
                              accentColorName: e.target.value,
                            },
                          });
                        }}
                        className="w-9 h-9 rounded-lg border border-white/20 cursor-pointer bg-transparent"
                      />
                      <div>
                        <span className="text-xs font-semibold text-white">Выбрать свой акцент (RGB)</span>
                        <p className="text-[11px] font-mono text-neutral-400">{customAccentHex}</p>
                      </div>
                    </div>
                  </div>

                  {/* Fonts selection */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Шрифт интерфейса
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {PRESET_FONTS.map((f) => {
                        const isSelected = settings.customization.fontFamily === f.family;
                        const simpleFontLabel = f.name.split(' (')[0];
                        return (
                          <div
                            key={f.id}
                            onClick={() =>
                              onUpdateSettings({
                                customization: {
                                  ...settings.customization,
                                  fontFamily: f.family,
                                  fontName: simpleFontLabel,
                                },
                              })
                            }
                            className="p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between"
                            style={
                              isSelected
                                ? {
                                    backgroundColor: `${accentColor}25`,
                                    borderColor: `${accentColor}80`,
                                    boxShadow: `0 0 15px ${accentColor}30`,
                                  }
                                : {
                                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                  }
                            }
                          >
                            <span
                              className="text-sm font-medium text-white"
                              style={{ fontFamily: f.family }}
                            >
                              {simpleFontLabel}
                            </span>
                            {isSelected && <Check className="w-4 h-4" style={{ color: accentColor }} />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Custom Font Upload button */}
                    <div className="pt-2">
                      <input
                        ref={fontInputRef}
                        type="file"
                        accept=".ttf,.otf,.woff,.woff2"
                        onChange={handleCustomFontUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fontInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border rounded-xl transition-all"
                        style={{
                          backgroundColor: `${accentColor}20`,
                          borderColor: `${accentColor}40`,
                          color: accentColor,
                        }}
                      >
                        <Upload className="w-4 h-4" />
                        <span>Загрузить свой шрифт (.ttf / .otf)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
