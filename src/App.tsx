import React, { useState, useEffect, useRef } from 'react';
import {
  AppSettings,
  ChatMessage,
  ChatSession,
  ModelOption,
  Attachment,
  LogEntry,
  CustomModelItem,
  ModelCustomConfig,
  DiscoveredModel,
} from './types';
import { PROVIDERS_LIST, PRESET_THEME_COLORS, PRESET_ACCENT_COLORS, PRESET_FONTS } from './data/defaultModels';
import {
  encryptData,
  decryptData,
  getHardwareId,
  hashPassword,
} from './utils/crypto';
import { createSpeechRecognizer } from './utils/speech';
import { sendChatMessageStream, discoverProviderModels, discoverLocalPort } from './services/apiService';

// Components
import { WelcomeModal } from './components/WelcomeModal';
import { TransferAlertModal } from './components/TransferAlertModal';
import { ConsoleModal } from './components/ConsoleModal';
import { SettingsModal } from './components/SettingsModal';
import { ModelSettingsModal } from './components/ModelSettingsModal';
import { ChatDrawer } from './components/ChatDrawer';
import { ChatArea } from './components/ChatArea';
import { ChatInputBar } from './components/ChatInputBar';
import { HuggingFaceModal } from './components/HuggingFaceModal';
import { CustomModelModal } from './components/CustomModelModal';

const DEFAULT_SETTINGS: AppSettings = {
  apiKeys: {
    google: '',
    openai: '',
    anthropic: '',
    mistral: '',
    groq: '',
    deepseek: '',
    perplexity: '',
    xai: '',
    meta: '',
    alibaba: '',
    cohere: '',
    openrouter: '',
    together: '',
    huggingface: '',
    custom: '',
  },
  systemPrompt: '',
  autoDiscoverModels: false,
  maxMessagesInContext: 20,
  maxSavedChats: 5,
  copyModelsToAppData: false,
  enabledModelIds: [
    'gemini-3.7-flash',
    'gemini-3.1-flash-lite',
    'gpt-4o-mini',
    'claude-3-haiku-20240307',
    'deepseek-chat',
    'llama-3.3-70b-versatile',
    'mistral-small-latest',
  ],
  customModels: [],
  modelConfigs: {},
  discoveredModels: {},
  localPortConfig: {
    enabled: false,
    host: '127.0.0.1',
    port: 11434,
    serverType: 'ollama',
    discoveredModels: [],
  },
  security: {
    encryptFiles: true,
    transferProtection: false,
    failedAttempts: 0,
  },
  customization: {
    useSimpleNames: false,
    userName: '',
    primaryColor: '#8a2be2',
    primaryColorName: 'Неоновый Аметист (По умолчанию)',
    accentColor: '#9333ea',
    accentColorName: 'Глубокий Сиреневый',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    fontName: 'Системный шрифт рабочего стола Windows (Default)',
    glowOpacity: 0.7,
    useOldBackground: false,
  },
};

export default function App() {
  // Application State
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Modals and UI overlays
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isTransferAlertOpen, setIsTransferAlertOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDotsMenuOpen, setIsDotsMenuOpen] = useState(false);
  const [isHuggingFaceOpen, setIsHuggingFaceOpen] = useState(false);
  const [isCustomModelOpen, setIsCustomModelOpen] = useState(false);
  const [isModelSettingsOpen, setIsModelSettingsOpen] = useState(false);
  const [selectedModelForSettings, setSelectedModelForSettings] = useState<ModelOption | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [shakeTab2, setShakeTab2] = useState(false);

  const speechRecognizerRef = useRef(createSpeechRecognizer());

  // Add a log entry
  const addLog = (
    level: LogEntry['level'],
    source: string,
    message: string,
    details?: any
  ) => {
    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      level,
      source,
      message,
      details,
    };
    setLogs((prev) => [entry, ...prev].slice(0, 300));
  };

  // 1. Initial Load & Hardware Binding Check
  useEffect(() => {
    addLog('info', 'System', 'Запуск ядра CHATOX AI...');

    const initApp = async () => {
      try {
        const currentHwId = await getHardwareId();
        const rawSettings = localStorage.getItem('chatox_settings_enc');
        const rawInitialized = localStorage.getItem('chatox_initialized');

        if (!rawInitialized) {
          setIsWelcomeOpen(true);
        }

        if (rawSettings) {
          let loadedSettings: AppSettings | null = null;
          try {
            // Try decrypting with hardware ID
            const decrypted = await decryptData(rawSettings, 'CHATOX_SECRET', currentHwId);
            if (decrypted) {
              loadedSettings = JSON.parse(decrypted);
            } else {
              // Try standard fallback without hwId
              const standardDecrypted = await decryptData(rawSettings, 'CHATOX_SECRET');
              if (standardDecrypted) {
                loadedSettings = JSON.parse(standardDecrypted);
              }
            }
          } catch (e) {
            console.warn('Settings decryption error:', e);
          }

          if (loadedSettings) {
            setSettings({
              ...DEFAULT_SETTINGS,
              ...loadedSettings,
              security: { ...DEFAULT_SETTINGS.security, ...(loadedSettings.security || {}) },
              customization: { ...DEFAULT_SETTINGS.customization, ...(loadedSettings.customization || {}) },
              modelConfigs: loadedSettings.modelConfigs || {},
              discoveredModels: loadedSettings.discoveredModels || {},
              localPortConfig: {
                ...DEFAULT_SETTINGS.localPortConfig,
                ...(loadedSettings.localPortConfig || {}),
                discoveredModels: Array.isArray(loadedSettings.localPortConfig?.discoveredModels)
                  ? loadedSettings.localPortConfig.discoveredModels.map((m: any) =>
                      typeof m === 'string' ? { id: `local/${m}`, name: m } : m
                    )
                  : [],
              },
            });

            // Check if transfer protection was active and bound to another device
            if (
              loadedSettings.security.transferProtection &&
              loadedSettings.security.boundHardwareId &&
              loadedSettings.security.boundHardwareId !== currentHwId
            ) {
              addLog('warn', 'Security', 'Обнаружен перенос зашифрованных файлов на другое устройство!');
              setIsTransferAlertOpen(true);
            }
          }
        }

        // Load saved chats
        const rawChats = localStorage.getItem('chatox_chats_enc');
        if (rawChats) {
          try {
            let loadedChats: ChatSession[] | null = null;
            if (rawChats.trim().startsWith('[')) {
              loadedChats = JSON.parse(rawChats);
            } else {
              // Try standard decrypt first
              const decChats = await decryptData(rawChats, 'CHATOX_SECRET');
              if (decChats) {
                loadedChats = JSON.parse(decChats);
              } else {
                // Try with hardware ID if transfer protection was on
                const decWithHw = await decryptData(rawChats, 'CHATOX_SECRET', currentHwId);
                if (decWithHw) {
                  loadedChats = JSON.parse(decWithHw);
                }
              }
            }

            if (loadedChats && Array.isArray(loadedChats) && loadedChats.length > 0) {
              setChats(loadedChats);
              setActiveChatId(loadedChats[0].id);
              addLog('info', 'Storage', `Восстановлено диалогов: ${loadedChats.length}`);
            }
          } catch (e) {
            console.warn('Chats decryption error:', e);
            addLog('warn', 'Storage', 'Не удалось восстановить историю чатов из хранилища');
          }
        }

        addLog('info', 'System', 'Окружение CHATOX AI готово к работе');
      } catch (err: any) {
        addLog('error', 'Init', `Ошибка инициализации: ${err?.message}`);
      }
    };

    initApp();
  }, []);

  // Sync settings changes to Encrypted Storage
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated: AppSettings = {
        ...prev,
        ...newSettings,
        security: { ...prev.security, ...(newSettings.security || {}) },
        customization: { ...prev.customization, ...(newSettings.customization || {}) },
        modelConfigs: { ...prev.modelConfigs, ...(newSettings.modelConfigs || {}) },
        discoveredModels: { ...prev.discoveredModels, ...(newSettings.discoveredModels || {}) },
        localPortConfig: {
          ...prev.localPortConfig,
          ...(newSettings.localPortConfig || {}),
        },
      };

      // Validation rule: If Transfer Protection is turned on without password -> trigger shake and warn
      if (
        updated.security.transferProtection &&
        !updated.security.rawPasswordForSession &&
        !updated.security.passwordHash
      ) {
        setShakeTab2(true);
        setTimeout(() => setShakeTab2(false), 1200);
        addLog('warn', 'Security', 'Защита от переноса требует обязательного задания пароля!');
      }

      (async () => {
        try {
          const hwId = await getHardwareId();
          if (updated.security.transferProtection && !updated.security.boundHardwareId) {
            updated.security.boundHardwareId = hwId;
          }

          const stringified = JSON.stringify(updated);
          const encrypted = updated.security.encryptFiles
            ? await encryptData(
                stringified,
                'CHATOX_SECRET',
                updated.security.transferProtection ? hwId : undefined
              )
            : stringified;

          localStorage.setItem('chatox_settings_enc', encrypted);
        } catch (e) {
          console.error('Error saving settings:', e);
        }
      })();

      return updated;
    });
  };

  // Sync chats changes to Encrypted Storage
  const saveChatsToStorage = async (updatedChats: ChatSession[]) => {
    try {
      const hwId = await getHardwareId();
      const trimmed = updatedChats.slice(0, settings.maxSavedChats);
      const stringified = JSON.stringify(trimmed);
      const encrypted = settings.security.encryptFiles
        ? await encryptData(
            stringified,
            'CHATOX_SECRET',
            settings.security.transferProtection ? hwId : undefined
          )
        : stringified;

      localStorage.setItem('chatox_chats_enc', encrypted);
    } catch (e) {
      console.error('Error saving chats:', e);
    }
  };

  // Get active chat session
  const currentChat = chats.find((c) => c.id === activeChatId);

  // Compute all available models dynamically with strict deduplication
  const discoveredPortModels: ModelOption[] = (settings.localPortConfig?.discoveredModels || []).map(
    (m: DiscoveredModel) => ({
      id: m.id,
      name: m.name,
      simpleName: m.name,
      provider: 'custom' as const,
      providerName: 'Локальный порт',
      simpleProviderName: 'Локальный',
      description: 'Модель с локального сервера',
      enabled: true,
    })
  );

  const dynamicDiscoveredModels: ModelOption[] = Object.entries(settings.discoveredModels || {}).flatMap(
    ([providerId, mList]) =>
      (mList || []).map((m: DiscoveredModel) => ({
        id: m.id,
        name: m.name,
        simpleName: m.name,
        provider: providerId as any,
        providerName: PROVIDERS_LIST.find((p) => p.id === providerId)?.name || providerId,
        simpleProviderName: PROVIDERS_LIST.find((p) => p.id === providerId)?.simpleName || providerId,
        description: '',
        enabled: true,
      }))
  );

  // Map to hold unique models, prioritizing default models, then custom, then port, then dynamic
  const modelsMap = new Map<string, ModelOption>();

  // 1. Preset provider models
  PROVIDERS_LIST.flatMap((p) => p.defaultModels).forEach((m) => {
    modelsMap.set(m.id, m);
  });

  // 2. Custom local models
  settings.customModels.forEach((cm) => {
    modelsMap.set(cm.id, {
      id: cm.id,
      name: cm.name,
      simpleName: cm.name,
      provider: 'custom' as const,
      providerName: 'Пользовательская',
      simpleProviderName: 'Своя',
      description: `Пользовательская модель (${cm.format || 'Local'})`,
      enabled: true,
      isCustom: true,
    });
  });

  // 3. Discovered port models
  discoveredPortModels.forEach((m) => {
    modelsMap.set(m.id, m);
  });

  // 4. Dynamic discovered models (add if not already present as preset)
  dynamicDiscoveredModels.forEach((m) => {
    if (!modelsMap.has(m.id)) {
      modelsMap.set(m.id, m);
    }
  });

  const allKnownModels: ModelOption[] = Array.from(modelsMap.values());

  // Enabled models filtered for bottom bar
  const enabledModels = allKnownModels.filter((m) =>
    settings.enabledModelIds.includes(m.id)
  );

  const activeModel =
    allKnownModels.find((m) => m.id === currentChat?.modelId) ||
    enabledModels[0] ||
    PROVIDERS_LIST[0].defaultModels[0];

  // First launch name save
  const handleWelcomeSaveName = (name: string) => {
    updateSettings({
      customization: {
        ...settings.customization,
        userName: name,
      },
    });
    localStorage.setItem('chatox_initialized', 'true');
    setIsWelcomeOpen(false);
    addLog('info', 'Auth', `Пользователь идентифицирован: ${name}`);
  };

  const handleWelcomeSkip = () => {
    updateSettings({
      customization: {
        ...settings.customization,
        userName: 'Skipped',
      },
    });
    localStorage.setItem('chatox_initialized', 'true');
    setIsWelcomeOpen(false);
    addLog('info', 'Auth', 'Пользователь пропустил ввод имени (Skipped)');
  };

  // Transfer protection unlock verification
  const handleVerifyTransferPassword = (password: string) => {
    const sessionPass = settings.security.rawPasswordForSession;
    if (sessionPass && password === sessionPass) {
      addLog('info', 'Security', 'Пароль подтвержден. Файлы расшифрованы для нового накопителя.');
      return true;
    }
    addLog('warn', 'Security', 'Неудачная попытка ввода пароля защиты от переноса');
    return false;
  };

  // Create a new chat session
  const handleCreateNewChat = () => {
    const newChat: ChatSession = {
      id: `chat_${Date.now()}`,
      title: 'Новый чат',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      modelId: activeModel.id,
    };

    const updated = [newChat, ...chats].slice(0, settings.maxSavedChats);
    setChats(updated);
    setActiveChatId(newChat.id);
    saveChatsToStorage(updated);
    addLog('info', 'Chat', 'Создан новый диалог');
  };

  // Switch model on the fly
  const handleSelectModel = (model: ModelOption) => {
    if (!currentChat) {
      const newChat: ChatSession = {
        id: `chat_${Date.now()}`,
        title: 'Новый чат',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        modelId: model.id,
      };
      const updated = [newChat, ...chats];
      setChats(updated);
      setActiveChatId(newChat.id);
      saveChatsToStorage(updated);
    } else {
      const updated = chats.map((c) =>
        c.id === currentChat.id ? { ...c, modelId: model.id, updatedAt: Date.now() } : c
      );
      setChats(updated);
      saveChatsToStorage(updated);
    }
    addLog('info', 'Model', `Модель переключена на: ${model.name}`);
  };

  // Auto-discover test models
  const handleDiscoverModels = async () => {
    setIsDiscovering(true);
    addLog('api', 'Discover', 'Запуск тестирования подключенных API-ключей...');

    try {
      const activeProviders = (Object.keys(settings.apiKeys) as (keyof typeof settings.apiKeys)[]).filter(
        (p) => settings.apiKeys[p]?.trim() || p === 'google'
      );

      const newDiscoveredMap: Record<string, DiscoveredModel[]> = {
        ...(settings.discoveredModels || {}),
      };

      for (const provider of activeProviders) {
        const result = await discoverProviderModels(provider, settings.apiKeys[provider]);

        if (result.success) {
          addLog('info', 'Discover', `[${provider.toUpperCase()}] Проверка успешна: ${result.status}`);
          if (Array.isArray(result.models) && result.models.length > 0) {
            newDiscoveredMap[provider] = result.models.map((m: any) => ({
              id: typeof m === 'string' ? m : m.id,
              name: typeof m === 'string' ? m : m.name || m.id,
            }));
          }
        } else {
          addLog('warn', 'Discover', `[${provider.toUpperCase()}] Ошибка: ${result.error || result.status}`);
        }
      }

      updateSettings({ discoveredModels: newDiscoveredMap });
    } catch (e: any) {
      addLog('error', 'Discover', `Сбой автопоиска: ${e?.message}`);
    } finally {
      setIsDiscovering(false);
    }
  };

  // Toggle voice recognition
  const handleToggleVoice = () => {
    const recognizer = speechRecognizerRef.current;
    if (isListening) {
      recognizer.stop();
      setIsListening(false);
      addLog('info', 'Voice', 'Голосовой ввод остановлен');
    } else {
      const started = recognizer.start(
        (transcript) => {
          setInputText(transcript);
        },
        (error) => {
          setIsListening(false);
          addLog('error', 'Voice', error);
        }
      );
      if (started) {
        setIsListening(true);
        addLog('info', 'Voice', 'Слушаю микрофон...');
      }
    }
  };

  // Send message and handle streaming
  const handleSendMessage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed && attachments.length === 0) return;

    let chatId = activeChatId;
    let currentSession = chats.find((c) => c.id === chatId);

    if (!currentSession) {
      currentSession = {
        id: `chat_${Date.now()}`,
        title: 'Новый чат',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        modelId: activeModel.id,
      };
      chatId = currentSession.id;
    }

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
      attachments: [...attachments],
    };

    const assistantPlaceholderId = `asst_${Date.now() + 1}`;
    const assistantMessage: ChatMessage = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now() + 1,
      modelId: activeModel.id,
      modelName: activeModel.name,
      status: 'streaming',
    };

    const newMessages = [...currentSession.messages, userMessage, assistantMessage];
    const isFirstUserMessage = currentSession.messages.filter((m) => m.role === 'user').length === 0;

    let updatedSession: ChatSession = {
      ...currentSession,
      messages: newMessages,
      updatedAt: Date.now(),
    };

    let updatedChats = chats.some((c) => c.id === chatId)
      ? chats.map((c) => (c.id === chatId ? updatedSession : c))
      : [updatedSession, ...chats];

    setChats(updatedChats);
    setActiveChatId(chatId);
    saveChatsToStorage(updatedChats);
    setInputText('');
    setAttachments([]);
    setIsLoading(true);

    addLog('api', 'Chat', `Запрос к модели [${activeModel.name}] (${activeModel.id})`);

    // Prepare context window limited to maxMessagesInContext
    const contextSlice = newMessages
      .slice(0, -1)
      .slice(-settings.maxMessagesInContext);

    let accumulatedText = '';

    await sendChatMessageStream({
      modelId: activeModel.id,
      provider: activeModel.provider,
      messages: contextSlice,
      systemPrompt: settings.systemPrompt,
      modelConfig: settings.modelConfigs?.[activeModel.id],
      localPortConfig: settings.localPortConfig,
      apiKeys: settings.apiKeys,
      attachments: userMessage.attachments,
      onChunk: (chunk: string) => {
        accumulatedText += chunk;
        setChats((prev) =>
          prev.map((c) => {
            if (c.id !== chatId) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? {
                      ...m,
                      content: accumulatedText,
                      status: 'streaming' as const,
                    }
                  : m
              ),
            };
          })
        );
      },
      onError: (errMsg: string) => {
        addLog('error', 'Chat', `Ошибка генерации: ${errMsg}`);
        setChats((prev) => {
          const errorUpdated = prev.map((c) => {
            if (c.id !== chatId) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? {
                      ...m,
                      content: accumulatedText ? `${accumulatedText}\n\n⚠️ **${errMsg}**` : `⚠️ **Ошибка генерации:**\n\n${errMsg}`,
                      status: 'error' as const,
                    }
                  : m
              ),
            };
          });
          saveChatsToStorage(errorUpdated);
          return errorUpdated;
        });
      },
      onDone: () => {
        setIsLoading(false);
        setChats((prev) => {
          const doneUpdated = prev.map((c) => {
            if (c.id !== chatId) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? {
                      ...m,
                      status: 'complete' as const,
                    }
                  : m
              ),
            };
          });

          if (isFirstUserMessage && trimmed) {
            const titleSnippet = trimmed.slice(0, 30) + (trimmed.length > 30 ? '...' : '');
            const finalWithTitle = doneUpdated.map((c) =>
              c.id === chatId ? { ...c, title: titleSnippet } : c
            );
            saveChatsToStorage(finalWithTitle);
            return finalWithTitle;
          }

          saveChatsToStorage(doneUpdated);
          return doneUpdated;
        });
        addLog('info', 'Chat', `Ответ от [${activeModel.name}] успешно получен`);
      },
    });

    setIsLoading(false);
  };

  // Delete chat
  const handleDeleteChat = (id: string) => {
    const updated = chats.filter((c) => c.id !== id);
    setChats(updated);
    saveChatsToStorage(updated);
    if (activeChatId === id) {
      setActiveChatId(updated[0]?.id || null);
    }
    addLog('info', 'Chat', 'Диалог удален');
  };

  // Export chat
  const handleExportChat = (id: string) => {
    const chat = chats.find((c) => c.id === id);
    if (!chat) return;

    const exportData = {
      title: chat.title,
      model: chat.modelId,
      exportedAt: new Date().toISOString(),
      messages: chat.messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp).toISOString(),
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatox_${chat.title.replace(/\s+/g, '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('info', 'Export', `Чат "${chat.title}" экспортирован`);
  };

  // Handle per-model config save
  const handleSaveModelConfig = (modelId: string, config: ModelCustomConfig) => {
    updateSettings({
      modelConfigs: {
        ...(settings.modelConfigs || {}),
        [modelId]: config,
      },
    });
    addLog('info', 'Model', `Сохранены индивидуальные параметры для модели ${modelId}`);
  };

  const hexToRgb = (hex: string) => {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
  };

  return (
    <div
      className="relative flex flex-col w-full h-screen overflow-hidden bg-[#050508] text-neutral-100 select-none"
      style={{
        fontFamily: settings.customization.fontFamily,
        ['--primary-color' as any]: settings.customization.primaryColor,
        ['--primary-rgb' as any]: hexToRgb(settings.customization.primaryColor),
        ['--accent-color' as any]: settings.customization.accentColor,
        ['--accent-rgb' as any]: hexToRgb(settings.customization.accentColor),
      } as React.CSSProperties}
    >
      {/* Background Neon Glow Auras: Accent in center, Primary changing edges and close to center, or Old mode */}
      {settings.customization.useOldBackground ? (
        <div
          className="fixed inset-0 pointer-events-none z-0 transition-all duration-700"
          style={{
            opacity: settings.customization.glowOpacity ?? 0.7,
          }}
        >
          <div
            className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none opacity-50"
            style={{
              background: `radial-gradient(circle, ${settings.customization.primaryColor} 0%, transparent 70%)`,
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/3 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none opacity-45"
            style={{
              background: `radial-gradient(circle, ${settings.customization.accentColor} 0%, transparent 70%)`,
            }}
          />
        </div>
      ) : (
        <div
          className="fixed inset-0 pointer-events-none z-0 transition-all duration-700"
          style={{
            opacity: settings.customization.glowOpacity ?? 0.7,
            background: `radial-gradient(circle at 50% 50%, ${settings.customization.accentColor} 0%, ${settings.customization.primaryColor} 45%, #050508 85%)`,
          }}
        />
      )}

      {/* Main Chat Area */}
      <ChatArea
        messages={currentChat?.messages || []}
        userName={settings.customization.userName}
        activeModel={activeModel}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenConsole={() => setIsConsoleOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isDotsMenuOpen={isDotsMenuOpen}
        onToggleDotsMenu={() => setIsDotsMenuOpen(!isDotsMenuOpen)}
        accentColor={settings.customization.accentColor}
      />

      {/* Bottom Message Input Bar */}
      <ChatInputBar
        inputText={inputText}
        onInputChange={setInputText}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        activeModel={activeModel}
        availableModels={enabledModels}
        onSelectModel={handleSelectModel}
        isListening={isListening}
        onToggleVoice={handleToggleVoice}
        attachments={attachments}
        onAddAttachment={(att) => setAttachments((prev) => [...prev, att])}
        onRemoveAttachment={(idx) => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
        useSimpleNames={settings.customization.useSimpleNames}
        accentColor={settings.customization.accentColor}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Slide-out Left Drawer for Saved Chats */}
      <ChatDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => setActiveChatId(id)}
        onNewChat={handleCreateNewChat}
        onDeleteChat={handleDeleteChat}
        onExportChat={handleExportChat}
        maxSavedChats={settings.maxSavedChats}
        isEncrypted={settings.security.encryptFiles}
        accentColor={settings.customization.accentColor}
      />

      {/* Settings Modal (Tab 1, Tab 2, Tab 3) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onOpenHuggingFace={() => setIsHuggingFaceOpen(true)}
        onOpenCustomModel={() => setIsCustomModelOpen(true)}
        onOpenModelSettings={(model) => {
          setSelectedModelForSettings(model);
          setIsModelSettingsOpen(true);
        }}
        onDiscoverModels={handleDiscoverModels}
        isDiscovering={isDiscovering}
        shakeTab2={shakeTab2}
      />

      {/* Per-Model Custom Settings Modal (System prompt, Temperature, Tokens, Top-P) */}
      {selectedModelForSettings && (
        <ModelSettingsModal
          isOpen={isModelSettingsOpen}
          onClose={() => {
            setIsModelSettingsOpen(false);
            setSelectedModelForSettings(null);
          }}
          model={selectedModelForSettings}
          config={settings.modelConfigs?.[selectedModelForSettings.id]}
          onSaveConfig={(modelId, cfg) => handleSaveModelConfig(modelId, cfg)}
          accentColor={settings.customization.primaryColor}
        />
      )}

      {/* Console Log Window */}
      <ConsoleModal
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        logs={logs}
        onClearLogs={() => setLogs([])}
        accentColor={settings.customization.primaryColor}
      />

      {/* Hugging Face Connector Modal */}
      <HuggingFaceModal
        isOpen={isHuggingFaceOpen}
        onClose={() => setIsHuggingFaceOpen(false)}
        onAddModel={(model) => {
          updateSettings({
            customModels: [...settings.customModels, model],
            enabledModelIds: [...settings.enabledModelIds, model.id],
          });
          setIsHuggingFaceOpen(false);
          addLog('info', 'HF', `Подключена модель Hugging Face: ${model.name}`);
        }}
        accentColor={settings.customization.primaryColor}
      />

      {/* Local / Custom Model Modal */}
      <CustomModelModal
        isOpen={isCustomModelOpen}
        onClose={() => setIsCustomModelOpen(false)}
        onAddModel={(model) => {
          updateSettings({
            customModels: [...settings.customModels, model],
            enabledModelIds: [...settings.enabledModelIds, model.id],
          });
          setIsCustomModelOpen(false);
          addLog('info', 'LocalModel', `Добавлена локальная модель: ${model.name}`);
        }}
        copyToAppData={settings.copyModelsToAppData}
        accentColor={settings.customization.primaryColor}
      />

      {/* First Launch Welcome Screen */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onSaveName={handleWelcomeSaveName}
        onSkip={handleWelcomeSkip}
        accentColor={settings.customization.primaryColor}
      />

      {/* Hardware Transfer Protection Alert Modal */}
      <TransferAlertModal
        isOpen={isTransferAlertOpen}
        onVerifyPassword={handleVerifyTransferPassword}
        onSuccess={() => {
          setIsTransferAlertOpen(false);
          addLog('info', 'Security', 'Доступ к хранилищу разблокирован');
        }}
        accentColor={settings.customization.primaryColor}
      />
    </div>
  );
}
