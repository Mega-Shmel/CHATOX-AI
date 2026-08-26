export type AppLanguage = 'ru' | 'en' | 'zh';

export interface Translations {
  // Language Selection & Welcome
  welcomeTitle: string;
  welcomeSubtitle: string;
  chooseLanguage: string;
  selectLanguageDesc: string;
  english: string;
  russian: string;
  chinese: string;
  enterYourName: string;
  nameInputPlaceholder: string;
  nameNotice: string;
  skip: string;
  startSession: string;
  continueBtn: string;

  // Header and Navigation
  appTitle: string;
  appSubtitle: string;
  settings: string;
  console: string;
  history: string;
  newChat: string;
  searchModels: string;
  activeModel: string;
  offlineMode: string;
  chatsBtn: string;
  consoleLogs: string;
  openChatList: string;
  appMenu: string;

  // Tabs in Settings
  tabModels: string;
  tabNetwork: string;
  tabSecurity: string;
  tabCustomization: string;
  settingsTitle: string;
  doneClose: string;
  swipeTip: string;

  // Network & Mirrors Tab
  networkHeaderTitle: string;
  networkHeaderDesc: string;
  mirrorBadgeRu: string;
  mirrorStatusActive: string;
  directStatusActive: string;
  customStatusActive: string;
  testPing: string;
  testingPing: string;
  pingMs: string;
  selectConnectionMode: string;
  
  modeMirrorTitle: string;
  modeMirrorBadge: string;
  modeMirrorDesc: string;
  modeMirrorFeature1: string;
  modeMirrorFeature2: string;
  modeMirrorFeature3: string;
  
  modeDirectTitle: string;
  modeDirectBadge: string;
  modeDirectDesc: string;
  
  modeCustomTitle: string;
  modeCustomBadge: string;
  modeCustomDesc: string;
  customMirrorUrlLabel: string;
  customMirrorUrlPlaceholder: string;
  
  proxyAllProvidersTitle: string;
  proxyAllProvidersDesc: string;
  
  xboxDnsTitle: string;
  xboxDnsDesc: string;
  xboxDnsInstruction: string;
  primaryDns: string;
  secondaryDns: string;
  androidPrivateDns: string;
  copied: string;
  copy: string;
  expand: string;
  collapse: string;

  // Additional i18n keys for Settings & Models
  prevTab: string;
  nextTab: string;
  globalSystemPromptTip: string;
  maxContextMessages: string;
  defaultMaxContext: string;
  maxSavedChatsLabel: string;
  defaultMaxSavedChats: string;
  autoDiscoverTitle: string;
  autoDiscoverDesc: string;
  discovering: string;
  discoverModels: string;
  localPortTitle: string;
  localPortDesc: string;
  hostIp: string;
  port: string;
  serverType: string;
  connecting: string;
  discoverPortModels: string;
  discoveredPortModels: string;
  localServerModelDesc: string;
  modelSettingsTooltip: string;
  copyAppDataTitle: string;
  saveToExternalTitle: string;
  saveToExternalDesc: string;
  manualBackupLabel: string;
  saving: string;
  makeBackup: string;
  addedModelFilesTitle: string;
  newModelNamePlaceholder: string;
  saveName: string;
  clickToRenameTip: string;
  customProviderName: string;
  customSimpleProvider: string;
  customModelDesc: string;
  providersSectionTitle: string;
  keySpecified: string;
  keyNotEntered: string;
  freeKeyNotice: string;
  enterApiKeyFor: string;
  testKeyTooltip: string;
  testKeyBtn: string;
  ruNetworkModeLabel: string;
  ruNetworkMirror: string;
  ruNetworkCustom: string;
  ruNetworkDirect: string;
  presetModelsLabel: string;
  discoveredApiModelsLabel: string;
  modelParamsTooltip: string;
  networkModeHeader: string;
  rfSupportBadge: string;
  mirrorActiveDesc: string;
  customActiveDesc: string;
  directActiveDesc: string;
  customMirrorExample: string;
  masterPasswordLabel: string;
  masterPasswordPlaceholder: string;
  showPasswordTooltip: string;
  showPasswordNotice: string;
  vaultMemoTitle: string;
  vaultMemoDesc: string;
  manualExportTitle: string;
  manualExportDesc: string;
  downloadJsonBtn: string;
  classicBgTitle: string;
  classicBgDesc: string;
  primaryColorTitle: string;
  customPrimaryRgb: string;
  accentColorTitle: string;
  customAccentRgb: string;
  uploadFontBtn: string;

  // Security Tab
  securityHeaderTitle: string;
  securityHeaderDesc: string;
  encryptionTitle: string;
  encryptionDesc: string;
  transferProtectionTitle: string;
  transferProtectionDesc: string;
  maxChatsTitle: string;
  maxChatsDesc: string;
  maxContextTitle: string;
  maxContextDesc: string;
  externalBackupTitle: string;
  externalBackupDesc: string;
  createBackupBtn: string;
  exportManualBackupBtn: string;

  // Customization Tab
  customizationHeaderTitle: string;
  customizationHeaderDesc: string;
  interfaceLanguageTitle: string;
  interfaceLanguageDesc: string;
  languageSettingTitle: string;
  languageSettingDesc: string;
  paletteTitle: string;
  paletteDesc: string;
  customColorTitle: string;
  fontTitle: string;
  fontDesc: string;
  glowTitle: string;
  glowDesc: string;
  userNameTitle: string;
  userNameDesc: string;
  userNamePlaceholder: string;
  simpleNamesTitle: string;
  simpleNamesDesc: string;

  // Models Tab
  modelsHeaderTitle: string;
  modelsHeaderDesc: string;
  apiKeysNotice: string;
  enterKeyPlaceholder: string;
  testKey: string;
  keyValid: string;
  keyInvalid: string;
  addCustomModel: string;
  addFromHuggingFace: string;
  scanLocalPorts: string;
  configureMirrorBtn: string;
  globalSystemPromptTitle: string;
  globalSystemPromptDesc: string;
  globalSystemPromptPlaceholder: string;

  // Chat Area & Input
  chatPlaceholder: string;
  attachFile: string;
  voiceInput: string;
  listeningVoice: string;
  send: string;
  stopGeneration: string;
  copyMessage: string;
  editMessage: string;
  deleteChat: string;
  clearChat: string;
  noMessagesYet: string;
  noMessagesSub: string;
  greetingHello: string;
  greetingDefault: string;
  greetingSub: string;
  speak: string;
  generationError: string;
  searchActiveModels: string;
  noModelsFound: string;
  activeModelsCount: string;
  modelsAvailableCount: string;
  manageModels: string;
  voiceListeningTooltip: string;
  voiceInputTooltip: string;
  fileUploadTooltip: string;
  sendMessageTooltip: string;
  inputPlaceholder: string;

  // Chat Drawer
  savedChatsTitle: string;
  slotsOf: string;
  slotsSuffix: string;
  searchChatsPlaceholder: string;
  noSavedChats: string;
  noSavedChatsSub: string;
  messagesCount: string;
  exportChat: string;
  deleteChatTooltip: string;

  // Console Modal
  consoleTitle: string;
  clearLogs: string;
  exportLogs: string;
  allLogs: string;
  searchLogsPlaceholder: string;
  noLogs: string;

  // Model Settings Modal (⚙️)
  modelParamsTitle: string;
  displayNameLabel: string;
  systemPromptLabel: string;
  systemPromptBadge: string;
  systemPromptPlaceholder: string;
  temperatureLabel: string;
  temperatureDesc: string;
  maxTokensLabel: string;
  topPLabel: string;
  resetDefaults: string;
  saveParameters: string;
  saved: string;

  // Custom Model Modal
  addCustomModelTitle: string;
  addCustomModelSub: string;
  tabModelFile: string;
  tabOllama: string;
  chooseModelFile: string;
  modelNameLabel: string;
  endpointLabel: string;
  addModelBtn: string;
  copyAppDataNotice: string;

  // HuggingFace Modal
  hfTitle: string;
  hfSearchPlaceholder: string;
  hfDirectRepoLabel: string;
  hfAddRepoBtn: string;
  hfFilterAll: string;
  hfFilterGguf: string;
  hfFilterTextGen: string;
  hfAdded: string;
  hfAdd: string;
  hfDownloads: string;

  // Transfer Alert Modal
  transferAlertHeader: string;
  transferAlertTitle: string;
  transferAlertDesc: string;
  transferPasswordLabel: string;
  transferPasswordPlaceholder: string;
  transferUnlockBtn: string;
  transferTooManyAttempts: string;
  transferInvalidPassword: string;
}

export const TRANSLATIONS: Record<AppLanguage, Translations> = {
  en: {
    welcomeTitle: 'Welcome to CHATOX AI',
    welcomeSubtitle: 'Universal Private AI Assistant & Workspace',
    chooseLanguage: 'Choose Your Language',
    selectLanguageDesc: 'Please choose your preferred interface language. You can always change it later in Settings.',
    english: 'English',
    russian: 'Русский (Russian)',
    chinese: '简体中文 (Chinese)',
    enterYourName: 'What should CHATOX call you?',
    nameInputPlaceholder: 'Your name or nickname...',
    nameNotice: 'Enter your name or nickname. You can customize it at any time in Settings.',
    skip: 'Skip for now',
    startSession: 'Start Session',
    continueBtn: 'Continue',

    appTitle: 'CHATOX AI',
    appSubtitle: 'Universal AI Assistant',
    settings: 'Settings',
    console: 'Console',
    history: 'History',
    newChat: 'New Chat',
    searchModels: 'Search models...',
    activeModel: 'Active Model',
    offlineMode: 'Offline / Local',
    chatsBtn: 'Chats',
    consoleLogs: 'Console (Logs)',
    openChatList: 'Open chat list',
    appMenu: 'Application menu',

    tabModels: 'AI Models',
    tabNetwork: 'Network & Mirrors',
    tabSecurity: 'Security',
    tabCustomization: 'Customization',
    settingsTitle: 'CHATOX Settings',
    doneClose: 'Done / Close',
    swipeTip: 'Swipe left/right or scroll to switch tabs',

    networkHeaderTitle: 'Network, Mirrors & Bypass',
    networkHeaderDesc: 'Switch Google Gemini mirror and proxy settings for Web and Mobile devices',
    mirrorBadgeRu: 'Bypass / Proxy',
    mirrorStatusActive: '⚡ Built-in cloud mirror is active — Google Gemini works without VPN or Xbox DNS.',
    directStatusActive: '🌐 Direct connection is active — requires VPN or Xbox DNS in restricted regions.',
    customStatusActive: '🛠️ Custom proxy endpoint is active.',
    testPing: 'Test Latency',
    testingPing: 'Testing...',
    pingMs: 'ms',
    selectConnectionMode: 'Select Connection Mode:',

    modeMirrorTitle: '⚡ Built-in Cloud Mirror',
    modeMirrorBadge: 'Recommended',
    modeMirrorDesc: 'Routes requests to Google Gemini through secure cloud gateway to bypass regional restrictions.',
    modeMirrorFeature1: 'Works on PC (Web / Desktop)',
    modeMirrorFeature2: 'Works on Smartphones (Android)',
    modeMirrorFeature3: 'No VPN or DNS configuration needed',

    modeDirectTitle: '🌐 Direct Google API Connection',
    modeDirectBadge: 'Requires VPN / DNS in RU',
    modeDirectDesc: 'Direct HTTPS requests to generativelanguage.googleapis.com. Requires VPN or Xbox DNS in restricted regions.',

    modeCustomTitle: '🛠️ Custom Mirror URL / Worker',
    modeCustomBadge: 'Advanced',
    modeCustomDesc: 'Connect your own reverse proxy or custom Cloudflare Worker for Gemini.',
    customMirrorUrlLabel: 'Custom Gemini Mirror URL:',
    customMirrorUrlPlaceholder: 'https://my-gemini-proxy.workers.dev',

    proxyAllProvidersTitle: 'Proxy all AI providers',
    proxyAllProvidersDesc: 'Route OpenAI, Anthropic, and Mistral requests through cloud gateway as well',

    xboxDnsTitle: 'Xbox DNS Configuration Guide (for Direct Connection)',
    xboxDnsDesc: 'Quick copy public DNS addresses to bypass Google blocks in restricted regions',
    xboxDnsInstruction: 'If you choose Direct Connection without built-in mirror, configure these DNS addresses in your system settings:',
    primaryDns: 'Primary DNS:',
    secondaryDns: 'Secondary DNS:',
    androidPrivateDns: 'Android Private DNS (Settings -> Connections -> Private DNS):',
    copied: 'Copied!',
    copy: 'Copy',
    expand: 'Expand ▼',
    collapse: 'Collapse ▲',

    securityHeaderTitle: 'Security & Data Protection',
    securityHeaderDesc: 'Client-side AES-256-GCM encryption and hardware device binding',
    encryptionTitle: 'End-to-End File Encryption',
    encryptionDesc: 'Encrypt all local settings and conversation history with AES-256',
    transferProtectionTitle: 'Device Transfer Protection',
    transferProtectionDesc: 'Bind encrypted storage to this hardware fingerprint',
    maxChatsTitle: 'Maximum Saved Chats',
    maxChatsDesc: 'Number of recent chats to retain in encrypted local storage',
    maxContextTitle: 'Context Message Limit',
    maxContextDesc: 'Maximum dialogue turns sent to AI models per request',
    externalBackupTitle: 'External Storage Backup',
    externalBackupDesc: 'Keep a persistent unencrypted copy in device storage (CHATOX_Data)',
    createBackupBtn: 'Backup to Storage',
    exportManualBackupBtn: 'Export JSON Backup',

    customizationHeaderTitle: 'Interface Customization',
    customizationHeaderDesc: 'Colors, typography, language, and personal branding',
    interfaceLanguageTitle: 'Interface Language',
    interfaceLanguageDesc: 'Choose your preferred display language across the application',
    languageSettingTitle: 'Interface Language',
    languageSettingDesc: 'Switch the display language for menus, settings, and buttons',
    paletteTitle: 'Color Theme Palette',
    paletteDesc: 'Select an accent glow and highlight color palette',
    customColorTitle: 'Custom Hex Color',
    fontTitle: 'Typography & Font',
    fontDesc: 'Choose system desktop font or modern sans-serif typography',
    glowTitle: 'Neon Glow Intensity',
    glowDesc: 'Adjust background ambient lighting and button illumination',
    userNameTitle: 'User Profile Name',
    userNameDesc: 'Name used by AI models when addressing you in chats',
    userNamePlaceholder: 'Your name...',
    simpleNamesTitle: 'Simplified Model Names',
    simpleNamesDesc: 'Display friendly short titles instead of full model IDs',

    modelsHeaderTitle: 'AI Models & Providers',
    modelsHeaderDesc: 'API keys, model parameters (⚙️), and local port integration',
    apiKeysNotice: 'Keys are stored locally with AES-256 encryption.',
    enterKeyPlaceholder: 'Paste your API key here...',
    testKey: 'Test Key',
    keyValid: 'Key is valid',
    keyInvalid: 'Invalid key',
    addCustomModel: 'Add Custom Model',
    addFromHuggingFace: 'Browse HuggingFace',
    scanLocalPorts: 'Scan Local Servers',
    configureMirrorBtn: 'Configure Mirror →',
    globalSystemPromptTitle: 'Global System Prompt (All Models)',
    globalSystemPromptDesc: 'General behavior instructions applied to every AI assistant',
    globalSystemPromptPlaceholder: 'e.g. You are a helpful, concise, and smart coding and reasoning AI assistant...',

    prevTab: 'Back',
    nextTab: 'Next',
    globalSystemPromptTip: '💡 Custom system prompt and temperature can be set per model using the gear icon (⚙️) next to its checkbox.',
    maxContextMessages: 'Max Messages in Context',
    defaultMaxContext: 'Default: 20 messages',
    maxSavedChatsLabel: 'Number of Saved Chats',
    defaultMaxSavedChats: 'Default: 5 chats in encrypted files',
    autoDiscoverTitle: 'Discover AI Models (Uses small API quota)',
    autoDiscoverDesc: 'Automatic verification and dynamic fetching of available models by keys',
    discovering: 'Checking...',
    discoverModels: 'Discover Models',
    localPortTitle: 'Local Port Connection',
    localPortDesc: 'Independent toggle and auto-discovery of locally running models (Ollama, LM Studio, vLLM)',
    hostIp: 'Host (IP)',
    port: 'Port',
    serverType: 'Server Type',
    connecting: 'Connecting...',
    discoverPortModels: 'Discover Models on Port',
    discoveredPortModels: 'Discovered models on port:',
    localServerModelDesc: 'Model from local server',
    modelSettingsTooltip: 'Individual model settings',
    copyAppDataTitle: 'Copy selected models to AppData on device',
    saveToExternalTitle: 'Save data to root near Download folder (/CHATOX_Data)',
    saveToExternalDesc: 'Protects settings and keys from deletion when reinstalling or updating APK',
    manualBackupLabel: 'Manual backup to persistent storage',
    saving: 'Saving...',
    makeBackup: 'Create Backup',
    addedModelFilesTitle: 'Added Model Files (Renaming)',
    newModelNamePlaceholder: 'New model name...',
    saveName: 'Save name',
    clickToRenameTip: 'Click to rename model',
    customProviderName: 'Custom',
    customSimpleProvider: 'Custom',
    customModelDesc: 'Custom model',
    providersSectionTitle: 'AI Providers & Active Model Selection',
    keySpecified: 'Key set',
    keyNotEntered: 'No key set',
    freeKeyNotice: 'Free key at aistudio.google.com',
    enterApiKeyFor: 'Enter API key for',
    testKeyTooltip: 'Test API key validity',
    testKeyBtn: 'Check',
    ruNetworkModeLabel: 'Network mode:',
    ruNetworkMirror: '⚡ Built-in Mirror (No VPN/DNS)',
    ruNetworkCustom: '🛠️ Custom Proxy',
    ruNetworkDirect: '🌐 Direct (Requires VPN or Xbox DNS)',
    presetModelsLabel: 'Preset models:',
    discoveredApiModelsLabel: 'Models discovered via API (names only):',
    modelParamsTooltip: 'System prompt and model parameters settings',
    networkModeHeader: 'Network Mode for Google Gemini & APIs',
    rfSupportBadge: 'Bypass / Proxy',
    mirrorActiveDesc: '⚡ Built-in cloud mirror is active — requests work reliably without VPN or Xbox DNS.',
    customActiveDesc: '🛠️ Custom proxy server is active.',
    directActiveDesc: '🌐 Direct connection is active — requires VPN or Xbox DNS in restricted regions.',
    customMirrorExample: 'Example: https://my-gemini-proxy.workers.dev (without trailing slash)',
    masterPasswordLabel: 'Unlock Master Password',
    masterPasswordPlaceholder: 'Enter master password...',
    showPasswordTooltip: 'Show password for 0.5 seconds',
    showPasswordNotice: 'Clicking the eye icon reveals the password for 0.5 seconds.',
    vaultMemoTitle: 'Memo: AppData Storage / Local Encrypted Vault',
    vaultMemoDesc: 'All keys, chats, and settings are saved in an isolated secure container. AES-256-GCM algorithm with PBKDF2 derived key (100,000 iterations).',
    manualExportTitle: 'Manual Backup Export',
    manualExportDesc: 'Download file containing all settings and chats for migration',
    downloadJsonBtn: 'Download .json',
    classicBgTitle: 'Classic background glow mode',
    classicBgDesc: 'Toggle classic background with dual-glow zones (center accent & edge main)',
    primaryColorTitle: 'Primary theme color (Applies across interface)',
    customPrimaryRgb: 'Select custom RGB color',
    accentColorTitle: 'Accent theme color',
    customAccentRgb: 'Select custom RGB accent',
    uploadFontBtn: 'Upload custom font (.ttf / .otf)',

    chatPlaceholder: 'Type a message or drop files... (Shift+Enter for new line)',
    attachFile: 'Attach files or images',
    voiceInput: 'Voice Input',
    listeningVoice: 'Listening... Speak now',
    send: 'Send',
    stopGeneration: 'Stop Generation',
    copyMessage: 'Copy text',
    editMessage: 'Edit message',
    deleteChat: 'Delete Chat',
    clearChat: 'Clear History',
    noMessagesYet: 'No messages yet in this chat',
    noMessagesSub: 'Select an AI model and start a conversation or ask a question.',
    greetingHello: 'Hello, {name}! Ready to work?',
    greetingDefault: 'Hello! Ready to work?',
    greetingSub: 'Ask any question, send a file, or use voice input. Current model:',
    speak: 'Read aloud',
    generationError: 'Response generation error',
    searchActiveModels: 'Search active models...',
    noModelsFound: 'No models found matching your query',
    activeModelsCount: 'Active models: ',
    modelsAvailableCount: 'Models available: ',
    manageModels: 'Manage Models',
    voiceListeningTooltip: 'Voice input active (click to stop)',
    voiceInputTooltip: 'Voice input (Speech recognition)',
    fileUploadTooltip: 'Attach file to prompt',
    sendMessageTooltip: 'Send message',
    inputPlaceholder: 'Type a message for AI...',

    savedChatsTitle: 'Saved Chats',
    slotsOf: 'of',
    slotsSuffix: 'slots',
    searchChatsPlaceholder: 'Search saved chats...',
    noSavedChats: 'No saved chats',
    noSavedChatsSub: 'Start a chat, and it will be encrypted in storage automatically',
    messagesCount: 'msgs',
    exportChat: 'Export chat (.json)',
    deleteChatTooltip: 'Delete chat',

    consoleTitle: 'CHATOX AI Console',
    clearLogs: 'Clear',
    exportLogs: 'Export',
    allLogs: 'ALL',
    searchLogsPlaceholder: 'Search console logs...',
    noLogs: 'Console log is empty',

    modelParamsTitle: 'Model Parameters',
    displayNameLabel: 'Display Name (Rename Model)',
    systemPromptLabel: 'Individual System Prompt',
    systemPromptBadge: 'Only for this model',
    systemPromptPlaceholder: 'Custom instruction for this model (overrides global prompt)...',
    temperatureLabel: 'Temperature (Creativity)',
    temperatureDesc: 'Lower = precise & analytical, Higher = creative & varied',
    maxTokensLabel: 'Max Output Tokens',
    topPLabel: 'Top-P Sampling',
    resetDefaults: 'Reset Defaults',
    saveParameters: 'Save Parameters',
    saved: 'Saved!',

    addCustomModelTitle: 'Add Custom Model',
    addCustomModelSub: 'GGUF / ONNX / safetensors or local Ollama server',
    tabModelFile: 'Model File (GGUF / ONNX)',
    tabOllama: 'Local Server (Ollama / LM Studio)',
    chooseModelFile: 'Choose model file (.gguf, .onnx, .safetensors)...',
    modelNameLabel: 'Model Name in Chat',
    endpointLabel: 'API Endpoint URL',
    addModelBtn: 'Add Model',
    copyAppDataNotice: 'File will be registered in local model registry',

    hfTitle: 'Direct Hugging Face Connection',
    hfSearchPlaceholder: 'Search text-generation / GGUF models on Hugging Face...',
    hfDirectRepoLabel: 'Direct Repo ID (e.g. TheBloke/Llama-2-7B-GGUF):',
    hfAddRepoBtn: 'Add Repository',
    hfFilterAll: 'All',
    hfFilterGguf: 'GGUF Only',
    hfFilterTextGen: 'Text Generation',
    hfAdded: 'Added',
    hfAdd: 'Add',
    hfDownloads: 'downloads',

    transferAlertHeader: 'Transfer Protection',
    transferAlertTitle: 'Data files were transferred',
    transferAlertDesc: 'Oops! It seems your data storage was transferred to another device! Please enter your security password to unlock, or reset AppData.',
    transferPasswordLabel: 'Decryption Password',
    transferPasswordPlaceholder: 'Enter security password...',
    transferUnlockBtn: 'Unlock Data',
    transferTooManyAttempts: 'Too many failed attempts. Please wait 5 minutes',
    transferInvalidPassword: 'Invalid password. Remaining attempts:',
  },

  ru: {
    welcomeTitle: 'Добро пожаловать в CHATOX AI',
    welcomeSubtitle: 'Универсальное приватное ИИ-пространство и чат-платформа',
    chooseLanguage: 'Выберите язык интерфейса',
    selectLanguageDesc: 'Пожалуйста, выберите предпочитаемый язык. Вы всегда сможете изменить его в Настройках.',
    english: 'English (Английский)',
    russian: 'Русский',
    chinese: '简体中文 (Китайский)',
    enterYourName: 'Как CHATOX может к вам обращаться?',
    nameInputPlaceholder: 'Ваше имя или никнейм...',
    nameNotice: 'Пожалуйста, введите своё имя или никнейм. Вы можете изменить его в любое время в настройках.',
    skip: 'Пропустить',
    startSession: 'Начать сессию',
    continueBtn: 'Продолжить',

    appTitle: 'CHATOX AI',
    appSubtitle: 'Универсальный ИИ-ассистент',
    settings: 'Настройки',
    console: 'Консоль',
    history: 'История',
    newChat: 'Новый чат',
    searchModels: 'Поиск моделей...',
    activeModel: 'Активная модель',
    offlineMode: 'Офлайн / Локально',
    chatsBtn: 'Чаты',
    consoleLogs: 'Консоль (Логи)',
    openChatList: 'Открыть список чатов',
    appMenu: 'Меню приложения',

    tabModels: 'ИИ-модели',
    tabNetwork: 'Сеть и Зеркала',
    tabSecurity: 'Безопасность',
    tabCustomization: 'Кастомизация',
    settingsTitle: 'CHATOX Настройки',
    doneClose: 'Готово / Закрыть',
    swipeTip: 'Свайпайте влево/вправо или листайте для переключения вкладок',

    networkHeaderTitle: 'Сеть, Зеркала и Обход блокировок (РФ)',
    networkHeaderDesc: 'Переключение зеркала для работы Google Gemini без VPN и Xbox DNS на ПК и смартфонах',
    mirrorBadgeRu: 'РФ поддержка',
    mirrorStatusActive: '⚡ Активно встроенное облачное зеркало — запросы работают стабильно на ПК и телефонах без VPN и Xbox DNS.',
    directStatusActive: '🌐 Активно прямое подключение — в РФ требуется Xbox DNS или включенный VPN.',
    customStatusActive: '🛠️ Активен собственный прокси-сервер.',
    testPing: 'Проверить пинг',
    testingPing: 'Проверка...',
    pingMs: 'мс',
    selectConnectionMode: 'Выберите режим подключения:',

    modeMirrorTitle: '⚡ Встроенное облачное зеркало',
    modeMirrorBadge: 'Рекомендуется для РФ',
    modeMirrorDesc: 'Автоматическая маршрутизация запросов к Google Gemini через защищенный облачный шлюз без геоблокировок Google.',
    modeMirrorFeature1: 'Работает на ПК (Web / Desktop)',
    modeMirrorFeature2: 'Работает на смартфонах (Android)',
    modeMirrorFeature3: 'Не требует VPN и настройки DNS',

    modeDirectTitle: '🌐 Прямое подключение к Google API',
    modeDirectBadge: 'Требует Xbox DNS / VPN в РФ',
    modeDirectDesc: 'Прямые запросы к generativelanguage.googleapis.com. В России работает только с Xbox DNS или VPN.',

    modeCustomTitle: '🛠️ Собственный URL зеркала / Worker',
    modeCustomBadge: 'Для продвинутых',
    modeCustomDesc: 'Возможность подключить персональный обратный прокси или развернутый Cloudflare Worker.',
    customMirrorUrlLabel: 'URL персонального зеркала Google Gemini:',
    customMirrorUrlPlaceholder: 'https://my-gemini-proxy.workers.dev',

    proxyAllProvidersTitle: 'Применять зеркало ко всем провайдерам',
    proxyAllProvidersDesc: 'Маршрутизировать запросы OpenAI, Anthropic и Mistral через защищенный облачный сервер',

    xboxDnsTitle: 'Инструкция: Настройка Xbox DNS (если используете прямое подключение)',
    xboxDnsDesc: 'Быстрое копирование публичных DNS для обхода блокировок Google в РФ',
    xboxDnsInstruction: 'Если вы хотите использовать Прямое подключение без встроенного зеркала, пропишите адреса Xbox DNS:',
    primaryDns: 'Основной DNS (Primary):',
    secondaryDns: 'Дополнительный DNS (Secondary):',
    androidPrivateDns: 'Частный DNS для Android (Настройки -> Подключения -> Частный DNS):',
    copied: 'Скопировано!',
    copy: 'Копировать',
    expand: 'Развернуть ▼',
    collapse: 'Свернуть ▲',

    securityHeaderTitle: 'Безопасность и защита данных',
    securityHeaderDesc: 'Сквозное шифрование AES-256-GCM и защита от переноса на чужие устройства',
    encryptionTitle: 'Шифрование файлов AES-256',
    encryptionDesc: 'Шифровать настройки и историю чатов в памяти устройства',
    transferProtectionTitle: 'Защита от переноса',
    transferProtectionDesc: 'Привязать хранилище к аппаратному идентификатору этого устройства',
    maxChatsTitle: 'Лимит сохранённых чатов',
    maxChatsDesc: 'Количество диалогов, хранящихся в зашифрованной локальной памяти',
    maxContextTitle: 'Лимит контекста сообщений',
    maxContextDesc: 'Количество последних сообщений диалога, отправляемых ИИ',
    externalBackupTitle: 'Постоянная копия в памяти устройства',
    externalBackupDesc: 'Сохранять резервную копию в папку CHATOX_Data для защиты при переустановке',
    createBackupBtn: 'Создать резервную копию',
    exportManualBackupBtn: 'Экспортировать JSON-файл',

    customizationHeaderTitle: 'Кастомизация интерфейса',
    customizationHeaderDesc: 'Палитра тем, кастомные цвета, шрифты, язык и отображение',
    interfaceLanguageTitle: 'Язык интерфейса / Language',
    interfaceLanguageDesc: 'Выберите язык отображения меню, кнопок и настроек приложения',
    languageSettingTitle: 'Язык интерфейса / Language',
    languageSettingDesc: 'Выберите язык отображения меню, кнопок и настроек приложения',
    paletteTitle: 'Цветовая палитра темы',
    paletteDesc: 'Выберите готовый акцентный цвет или настройте свой собственный',
    customColorTitle: 'Пользовательский HEX-цвет',
    fontTitle: 'Шрифт интерфейса',
    fontDesc: 'Выберите системный шрифт Windows/Android или современный гротеск',
    glowTitle: 'Интенсивность неонового свечения',
    glowDesc: 'Регулировка свечения кнопок, рамок и фонового градиента',
    userNameTitle: 'Имя пользователя',
    userNameDesc: 'Имя, по которому ИИ-модели будут обращаться к вам в диалогах',
    userNamePlaceholder: 'Ваше имя...',
    simpleNamesTitle: 'Простые названия моделей',
    simpleNamesDesc: 'Отображать понятные короткие имена вместо технических идентификаторов',

    modelsHeaderTitle: 'Конфигурация ИИ-моделей',
    modelsHeaderDesc: 'Управление API-ключами, выбор активных моделей, индивидуальные параметры (⚙️)',
    apiKeysNotice: 'Ключи сохраняются локально в зашифрованном виде (AES-256).',
    enterKeyPlaceholder: 'Вставьте ваш API-ключ...',
    testKey: 'Проверить ключ',
    keyValid: 'Ключ действителен',
    keyInvalid: 'Ошибка ключа',
    addCustomModel: 'Добавить кастомную модель',
    addFromHuggingFace: 'Каталог Hugging Face',
    scanLocalPorts: 'Сканировать порты (Ollama/LM Studio)',
    configureMirrorBtn: 'Настроить зеркало →',
    globalSystemPromptTitle: 'Глобальный системный промпт (Для всех моделей)',
    globalSystemPromptDesc: 'Общая инструкция поведения для всех подключенных нейросетей',
    globalSystemPromptPlaceholder: 'Например: Ты опытный и лаконичный помощник программиста, отвечай строго по делу...',

    prevTab: 'Назад',
    nextTab: 'Вперёд',
    globalSystemPromptTip: '💡 Для каждой конкретной модели можно задать индивидуальный системный промпт и температуру через значок шестерёнки (⚙️) рядом с чекбоксом.',
    maxContextMessages: 'Макс. сообщений в контексте',
    defaultMaxContext: 'По умолчанию: 20 сообщений',
    maxSavedChatsLabel: 'Количество сохраняемых чатов',
    defaultMaxSavedChats: 'По умолчанию: 5 чатов в зашифрованных файлах',
    autoDiscoverTitle: 'Поиск ИИ моделей (немного тратит лимит API-ключей)',
    autoDiscoverDesc: 'Автоматическая проверка и динамическое получение доступных моделей по ключам',
    discovering: 'Проверка...',
    discoverModels: 'Поиск моделей',
    localPortTitle: 'Подключение по локальному порту',
    localPortDesc: 'Отдельный переключатель и обнаружение локально запущенных моделей (Ollama, LM Studio, vLLM)',
    hostIp: 'Хост (IP)',
    port: 'Порт',
    serverType: 'Тип сервера',
    connecting: 'Подключение...',
    discoverPortModels: 'Обнаружить модели на порту',
    discoveredPortModels: 'Обнаруженные на порту модели:',
    localServerModelDesc: 'Модель с локального сервера',
    modelSettingsTooltip: 'Индивидуальные настройки модели',
    copyAppDataTitle: 'Копировать выбранные модели на устройство в AppData',
    saveToExternalTitle: 'Сохранять данные в корень рядом с папкой Download (/CHATOX_Data)',
    saveToExternalDesc: 'Защищает настройки и ключи от удаления при переустановке или обновлении APK',
    manualBackupLabel: 'Ручной бэкап в постоянную память',
    saving: 'Сохранение...',
    makeBackup: 'Сделать бэкап',
    addedModelFilesTitle: 'Добавленные файлы моделей (Переименование)',
    newModelNamePlaceholder: 'Новое имя модели...',
    saveName: 'Сохранить имя',
    clickToRenameTip: 'Нажмите для переименования модели',
    customProviderName: 'Пользовательская',
    customSimpleProvider: 'Своя',
    customModelDesc: 'Пользовательская модель',
    providersSectionTitle: 'Провайдеры ИИ и Выбор Активных Моделей',
    keySpecified: 'Ключ указан',
    keyNotEntered: 'Ключ не введен',
    freeKeyNotice: 'Бесплатный ключ на aistudio.google.com',
    enterApiKeyFor: 'Введите API ключ для',
    testKeyTooltip: 'Проверить работоспособность ключа',
    testKeyBtn: 'Проверить',
    ruNetworkModeLabel: 'Режим сети для РФ:',
    ruNetworkMirror: '⚡ Встроенное зеркало (Без VPN/DNS)',
    ruNetworkCustom: '🛠️ Пользовательский прокси',
    ruNetworkDirect: '🌐 Прямое (Нужен Xbox DNS или VPN)',
    presetModelsLabel: 'Предустановленные модели:',
    discoveredApiModelsLabel: 'Обнаруженные через API модели (названия без описания):',
    modelParamsTooltip: 'Настройки системного промпта и параметров модели',
    networkModeHeader: 'Режим сети для Google Gemini и API',
    rfSupportBadge: 'РФ поддержка',
    mirrorActiveDesc: '⚡ Активно встроенное облачное зеркало — запросы работают стабильно на ПК и телефонах без VPN и Xbox DNS.',
    customActiveDesc: '🛠️ Активен собственный прокси-сервер.',
    directActiveDesc: '🌐 Активно прямое подключение — в РФ требуется Xbox DNS или включенный VPN.',
    customMirrorExample: 'Пример: https://my-gemini-proxy.workers.dev (без завершающего слеша)',
    masterPasswordLabel: 'Мастер-пароль разблокировки',
    masterPasswordPlaceholder: 'Введите мастер-пароль...',
    showPasswordTooltip: 'Показать пароль на 0.5 секунды',
    showPasswordNotice: 'При нажатии на значок глаза пароль отображается на 0.5 секунды.',
    vaultMemoTitle: 'Памятка: Хранилище данных AppData / Local Encrypted Vault',
    vaultMemoDesc: 'Все ключи, чаты и настройки сохраняются в изолированном защищенном контейнере. Алгоритм AES-256-GCM с производным ключом через PBKDF2 (100,000 итераций).',
    manualExportTitle: 'Ручной экспорт резервной копии',
    manualExportDesc: 'Скачать файл со всеми настройками и чатами для переноса',
    downloadJsonBtn: 'Скачать .json',
    classicBgTitle: 'Классический фон (старый режим свечения)',
    classicBgDesc: 'Переключение со старым режимом фона (две зоны) на фокус центра (акцент) и краев (основной)',
    primaryColorTitle: 'Основной цвет темы (Применяется ко всему интерфейсу)',
    customPrimaryRgb: 'Выбрать свой цвет (RGB)',
    accentColorTitle: 'Акцентный цвет',
    customAccentRgb: 'Выбрать свой акцент (RGB)',
    uploadFontBtn: 'Загрузить свой шрифт (.ttf / .otf)',

    chatPlaceholder: 'Напишите сообщение или прикрепите файлы... (Shift+Enter для переноса)',
    attachFile: 'Прикрепить файлы или фото',
    voiceInput: 'Голосовой ввод',
    listeningVoice: 'Слушаю... Говорите',
    send: 'Отправить',
    stopGeneration: 'Остановить генерацию',
    copyMessage: 'Копировать текст',
    editMessage: 'Редактировать',
    deleteChat: 'Удалить чат',
    clearChat: 'Очистить историю',
    noMessagesYet: 'В этом чате пока нет сообщений',
    noMessagesSub: 'Выберите ИИ-модель и начните диалог или задайте вопрос.',
    greetingHello: 'Привет, {name}! Поработаем?',
    greetingDefault: 'Привет! Поработаем?',
    greetingSub: 'Задайте любой вопрос, отправьте файл или воспользуйтесь голосовым вводом. Текущая модель:',
    speak: 'Озвучить',
    generationError: 'Ошибка генерации ответа',
    searchActiveModels: 'Поиск по активным моделям...',
    noModelsFound: 'Модели по запросу не найдены',
    activeModelsCount: 'Активно моделей: ',
    modelsAvailableCount: 'Моделей доступно: ',
    manageModels: 'Управление моделями',
    voiceListeningTooltip: 'Идет голосовой ввод (нажмите для остановки)',
    voiceInputTooltip: 'Голосовой ввод (распознавание речи)',
    fileUploadTooltip: 'Загрузка файла к запросу',
    sendMessageTooltip: 'Отправить сообщение',
    inputPlaceholder: 'Введите сообщение для нейросети...',

    savedChatsTitle: 'Сохраненные чаты',
    slotsOf: 'из',
    slotsSuffix: 'слотов',
    searchChatsPlaceholder: 'Поиск по сохраненным диалогам...',
    noSavedChats: 'Нет сохраненных чатов',
    noSavedChatsSub: 'Начните диалог, и он автоматически зашифруется в хранилище',
    messagesCount: 'сообщ.',
    exportChat: 'Экспорт чата (.json)',
    deleteChatTooltip: 'Удалить чат',

    consoleTitle: 'Консоль CHATOX AI',
    clearLogs: 'Очистить',
    exportLogs: 'Экспорт',
    allLogs: 'ВСЕ',
    searchLogsPlaceholder: 'Поиск по логам...',
    noLogs: 'Журнал консоли пуст',

    modelParamsTitle: 'Параметры модели',
    displayNameLabel: 'Отображаемое название (Переименовать модель)',
    systemPromptLabel: 'Индивидуальный системный промпт',
    systemPromptBadge: 'Только для этой модели',
    systemPromptPlaceholder: 'Индивидуальная инструкция для этой модели (переопределяет глобальный промпт)...',
    temperatureLabel: 'Температура (Креативность)',
    temperatureDesc: 'Меньше = точно и строго, Больше = креативно и разнообразно',
    maxTokensLabel: 'Максимальное число токенов',
    topPLabel: 'Top-P (Вероятностная выборка)',
    resetDefaults: 'Сбросить по умолчанию',
    saveParameters: 'Сохранить параметры',
    saved: 'Сохранено!',

    addCustomModelTitle: 'Добавить свою модель',
    addCustomModelSub: 'GGUF / ONNX / safetensors или локальный сервер Ollama',
    tabModelFile: 'Файл модели (GGUF / ONNX)',
    tabOllama: 'Локальный сервер (Ollama / LM Studio)',
    chooseModelFile: 'Выберите файл модели (.gguf, .onnx, .safetensors)...',
    modelNameLabel: 'Название модели в чате',
    endpointLabel: 'URL эндпоинта API',
    addModelBtn: 'Добавить модель',
    copyAppDataNotice: 'Файл будет зарегистрирован в реестре локальных моделей',

    hfTitle: 'Прямое подключение к Hugging Face',
    hfSearchPlaceholder: 'Поиск GGUF / текстовых моделей на Hugging Face...',
    hfDirectRepoLabel: 'Прямой ID репозитория (например TheBloke/Llama-2-7B-GGUF):',
    hfAddRepoBtn: 'Добавить репозиторий',
    hfFilterAll: 'Все',
    hfFilterGguf: 'Только GGUF',
    hfFilterTextGen: 'Генерация текста',
    hfAdded: 'Добавлено',
    hfAdd: 'Добавить',
    hfDownloads: 'скачиваний',

    transferAlertHeader: 'Защита от переноса данных',
    transferAlertTitle: 'Файлы с данными были перенесены',
    transferAlertDesc: 'Ой-ёй! Кажется, файл с важными данными был перенесён на другое хранилище! Пожалуйста, введите пароль или удалите файл с данными из папки AppData.',
    transferPasswordLabel: 'Пароль расшифровки',
    transferPasswordPlaceholder: 'Введите установленный пароль...',
    transferUnlockBtn: 'Разблокировать данные',
    transferTooManyAttempts: 'Слишком много неверных попыток. Подождите 5 минут',
    transferInvalidPassword: 'Неверный пароль. Осталось попыток:',
  },

  zh: {
    welcomeTitle: '欢迎使用 CHATOX AI',
    welcomeSubtitle: '全能私密人工智能助手与工作空间',
    chooseLanguage: '选择界面语言',
    selectLanguageDesc: '请选择您的首选语言。您可以随时在设置中更改。',
    english: 'English (英语)',
    russian: 'Русский (俄语)',
    chinese: '简体中文',
    enterYourName: 'CHATOX 应该如何称呼您？',
    nameInputPlaceholder: '您的姓名或昵称...',
    nameNotice: '请输入您的姓名或昵称。您可以随时在设置中修改。',
    skip: '暂时跳过',
    startSession: '开始使用',
    continueBtn: '继续',

    appTitle: 'CHATOX AI',
    appSubtitle: '全能人工智能助手',
    settings: '设置',
    console: '控制台',
    history: '历史记录',
    newChat: '新对话',
    searchModels: '搜索模型...',
    activeModel: '当前模型',
    offlineMode: '离线 / 本地',
    chatsBtn: '对话列表',
    consoleLogs: '控制台 (日志)',
    openChatList: '打开对话列表',
    appMenu: '应用菜单',

    tabModels: 'AI 模型',
    tabNetwork: '网络与镜像',
    tabSecurity: '安全与保护',
    tabCustomization: '个性化定制',
    settingsTitle: 'CHATOX 设置',
    doneClose: '完成 / 关闭',
    swipeTip: '左右滑动或滚动以切换标签页',

    networkHeaderTitle: '网络、镜像与连接模式',
    networkHeaderDesc: '切换 Google Gemini 镜像及代理设置，适配电脑端与手机端',
    mirrorBadgeRu: '免代理支持',
    mirrorStatusActive: '⚡ 内置云端镜像已启用 — Google Gemini 无需 VPN 即可稳定运行。',
    directStatusActive: '🌐 直连模式已启用 — 受限地区需要专用 DNS 或 VPN。',
    customStatusActive: '🛠️ 自定义代理节点已启用。',
    testPing: '测试延迟',
    testingPing: '测试中...',
    pingMs: '毫秒',
    selectConnectionMode: '选择连接模式：',

    modeMirrorTitle: '⚡ 内置云端镜像代理',
    modeMirrorBadge: '推荐使用',
    modeMirrorDesc: '通过安全云端网关转发 Google Gemini 请求，突破区域连接限制。',
    modeMirrorFeature1: '支持电脑端 (Web / 桌面)',
    modeMirrorFeature2: '支持手机端 (Android)',
    modeMirrorFeature3: '无需繁琐配置 VPN 或 DNS',

    modeDirectTitle: '🌐 官方 API 直连',
    modeDirectBadge: '需特定网络环境',
    modeDirectDesc: '直接连接至 generativelanguage.googleapis.com。',

    modeCustomTitle: '🛠️ 自定义镜像 URL / Worker',
    modeCustomBadge: '高级设置',
    modeCustomDesc: '连接您自建的反向代理或 Cloudflare Worker。',
    customMirrorUrlLabel: '自定义 Gemini 镜像地址：',
    customMirrorUrlPlaceholder: 'https://my-gemini-proxy.workers.dev',

    proxyAllProvidersTitle: '所有 AI 服务应用镜像代理',
    proxyAllProvidersDesc: '将 OpenAI、Anthropic 和 Mistral 的请求同样通过安全网关转发',

    xboxDnsTitle: 'Xbox DNS 配置参考（直连模式专用）',
    xboxDnsDesc: '快速复制公共 DNS 地址以解除连接阻断',
    xboxDnsInstruction: '若选择直连模式且处于限制区域，请在系统网络中配置以下 DNS：',
    primaryDns: '首选 DNS (Primary):',
    secondaryDns: '备用 DNS (Secondary):',
    androidPrivateDns: 'Android 私人 DNS (设置 -> 连接 -> 私人 DNS):',
    copied: '已复制！',
    copy: '复制',
    expand: '展开 ▼',
    collapse: '收起 ▲',

    securityHeaderTitle: '安全与数据保护',
    securityHeaderDesc: '客户端 AES-256-GCM 加密与硬件设备指纹绑定',
    encryptionTitle: '端到端文件加密',
    encryptionDesc: '使用 AES-256 对本地设置和聊天历史进行加密存储',
    transferProtectionTitle: '防跨设备转移保护',
    transferProtectionDesc: '将加密存储与本机硬件特征绑定',
    maxChatsTitle: '最大保存对话数',
    maxChatsDesc: '本地加密存储保留的最近对话数量',
    maxContextTitle: '上下文消息上限',
    maxContextDesc: '单次请求发送给 AI 模型的对话轮数',
    externalBackupTitle: '外部持久化备份',
    externalBackupDesc: '在设备外部存储 (CHATOX_Data) 中保留备份，防止重新安装时丢失',
    createBackupBtn: '创建备份',
    exportManualBackupBtn: '导出 JSON 备份',

    customizationHeaderTitle: '界面与外观定制',
    customizationHeaderDesc: '主题配色、字体排版、语言与个性化称谓',
    interfaceLanguageTitle: '界面语言 / Language',
    interfaceLanguageDesc: '选择应用程序的显示语言',
    languageSettingTitle: '界面语言 / Language',
    languageSettingDesc: '切换菜单、设置和按钮的界面显示语言',
    paletteTitle: '主题配色方案',
    paletteDesc: '选择预设霓虹强调色或自定义颜色',
    customColorTitle: '自定义 HEX 颜色',
    fontTitle: '界面字体',
    fontDesc: '选择系统桌面字体或现代无衬线字体',
    glowTitle: '霓虹发光强度',
    glowDesc: '调整按钮与边框的背光辉光效果',
    userNameTitle: '用户称谓',
    userNameDesc: 'AI 模型在对话中称呼您的名字',
    userNamePlaceholder: '您的姓名...',
    simpleNamesTitle: '简化模型名称',
    simpleNamesDesc: '显示友好的简短名称，隐藏复杂的技术标识符',

    modelsHeaderTitle: 'AI 模型与供应商配置',
    modelsHeaderDesc: '管理 API 密钥、模型自定义参数 (⚙️) 及本地端口扫描',
    apiKeysNotice: 'API 密钥以 AES-256 加密形式安全保存在本地。',
    enterKeyPlaceholder: '在此粘贴您的 API 密钥...',
    testKey: '测试密钥',
    keyValid: '密钥有效',
    keyInvalid: '密钥无效',
    addCustomModel: '添加自定义模型',
    addFromHuggingFace: '浏览 HuggingFace',
    scanLocalPorts: '扫描本地服务 (Ollama/LM Studio)',
    configureMirrorBtn: '配置镜像代理 →',
    globalSystemPromptTitle: '全局系统提示词 (所有模型)',
    globalSystemPromptDesc: '适用于所有 AI 助手的通用行为与角色指令',
    globalSystemPromptPlaceholder: '例如：你是一个精通编程、逻辑清晰、回答简明扼要的智能 AI 助手...',

    prevTab: '上一页',
    nextTab: '下一页',
    globalSystemPromptTip: '💡 可通过复选框旁边的齿轮图标 (⚙️) 为每个模型配置单独的系统提示词和温度。',
    maxContextMessages: '上下文最大消息数',
    defaultMaxContext: '默认：20 条消息',
    maxSavedChatsLabel: '保存的对话数量',
    defaultMaxSavedChats: '默认：加密文件中保存 5 个对话',
    autoDiscoverTitle: '搜索 AI 模型（消耗少量 API 额度）',
    autoDiscoverDesc: '通过密钥自动检查并动态获取可用模型',
    discovering: '检查中...',
    discoverModels: '搜索模型',
    localPortTitle: '本地端口连接',
    localPortDesc: '独立开关并自动检测本地运行的模型（Ollama, LM Studio, vLLM）',
    hostIp: '主机 (IP)',
    port: '端口',
    serverType: '服务器类型',
    connecting: '连接中...',
    discoverPortModels: '检测端口上的模型',
    discoveredPortModels: '端口上检测到的模型：',
    localServerModelDesc: '本地服务器模型',
    modelSettingsTooltip: '单模型个性化设置',
    copyAppDataTitle: '复制所选模型到设备的 AppData 目录',
    saveToExternalTitle: '将数据保存到 Download 旁边的根目录 (/CHATOX_Data)',
    saveToExternalDesc: '重新安装或更新 APK 时保护设置和密钥不被删除',
    manualBackupLabel: '手动备份至存储',
    saving: '保存中...',
    makeBackup: '创建备份',
    addedModelFilesTitle: '已添加的模型文件（可重命名）',
    newModelNamePlaceholder: '新模型名称...',
    saveName: '保存名称',
    clickToRenameTip: '点击重命名模型',
    customProviderName: '自定义',
    customSimpleProvider: '自定义',
    customModelDesc: '自定义模型',
    providersSectionTitle: 'AI 提供商与活跃模型选择',
    keySpecified: '已设置密钥',
    keyNotEntered: '未输入密钥',
    freeKeyNotice: '在 aistudio.google.com 获取免费密钥',
    enterApiKeyFor: '请输入 API 密钥：',
    testKeyTooltip: '测试 API 密钥有效性',
    testKeyBtn: '测试',
    ruNetworkModeLabel: '网络模式：',
    ruNetworkMirror: '⚡ 内置镜像（无须 VPN/DNS）',
    ruNetworkCustom: '🛠️ 自定义代理',
    ruNetworkDirect: '🌐 直连（需要 VPN 或 Xbox DNS）',
    presetModelsLabel: '预设模型：',
    discoveredApiModelsLabel: '通过 API 检测到的模型（仅名称）：',
    modelParamsTooltip: '系统提示词和模型参数设置',
    networkModeHeader: 'Google Gemini 及 API 网络模式',
    rfSupportBadge: '代理/直连',
    mirrorActiveDesc: '⚡ 已激活内置云端镜像 — 请求无需 VPN 或 Xbox DNS 即可稳定工作。',
    customActiveDesc: '🛠️ 已激活自定义代理服务器。',
    directActiveDesc: '🌐 已激活直连模式 — 在受限地区需要 VPN 或 Xbox DNS。',
    customMirrorExample: '示例：https://my-gemini-proxy.workers.dev（结尾不要斜杠）',
    masterPasswordLabel: '解密主密码',
    masterPasswordPlaceholder: '输入主密码...',
    showPasswordTooltip: '显示密码 0.5 秒',
    showPasswordNotice: '点击眼睛图标将显示密码 0.5 秒。',
    vaultMemoTitle: '说明：AppData 存储 / 本地加密金库',
    vaultMemoDesc: '所有密钥、对话和设置都储存在隔离的加密容器中。采用 AES-256-GCM 算法和 PBKDF2 派生密钥（100,000 次迭代）。',
    manualExportTitle: '手动导出备份',
    manualExportDesc: '下载包含所有设置和对话的文件以便迁移',
    downloadJsonBtn: '下载 .json',
    classicBgTitle: '经典背景发光模式',
    classicBgDesc: '切换经典双区背景发光模式（中心强调 & 边缘主色）',
    primaryColorTitle: '主主题颜色（应用于整个界面）',
    customPrimaryRgb: '选择自定义 RGB 颜色',
    accentColorTitle: '强调颜色',
    customAccentRgb: '选择自定义 RGB 强调色',
    uploadFontBtn: '上传自定义字体 (.ttf / .otf)',

    chatPlaceholder: '输入消息或拖放文件... (Shift+Enter 换行)',
    attachFile: '添加文件或图片',
    voiceInput: '语音输入',
    listeningVoice: '正在聆听... 请讲话',
    send: '发送',
    stopGeneration: '停止生成',
    copyMessage: '复制文本',
    editMessage: '编辑消息',
    deleteChat: '删除对话',
    clearChat: '清空历史',
    noMessagesYet: '此对话暂无消息',
    noMessagesSub: '选择一款 AI 模型并开启对话或提出您的问题。',
    greetingHello: '你好，{name}！开始工作吧？',
    greetingDefault: '你好！开始工作吧？',
    greetingSub: '提出任何问题、发送文件或使用语音输入。当前模型：',
    speak: '朗读',
    generationError: '生成回复出错',
    searchActiveModels: '搜索活跃模型...',
    noModelsFound: '未找到匹配的模型',
    activeModelsCount: '活跃模型数：',
    modelsAvailableCount: '可用模型：',
    manageModels: '管理模型',
    voiceListeningTooltip: '正在语音输入（点击停止）',
    voiceInputTooltip: '语音输入（语音识别）',
    fileUploadTooltip: '附加文件至提示词',
    sendMessageTooltip: '发送消息',
    inputPlaceholder: '输入给 AI 的消息...',

    savedChatsTitle: '已保存的对话',
    slotsOf: ' / ',
    slotsSuffix: '槽位',
    searchChatsPlaceholder: '搜索已保存的对话...',
    noSavedChats: '暂无保存的对话',
    noSavedChatsSub: '开启对话后将自动加密保存至本地',
    messagesCount: '条消息',
    exportChat: '导出对话 (.json)',
    deleteChatTooltip: '删除对话',

    consoleTitle: 'CHATOX AI 控制台',
    clearLogs: '清空',
    exportLogs: '导出',
    allLogs: '全部',
    searchLogsPlaceholder: '搜索控制台日志...',
    noLogs: '控制台日志为空',

    modelParamsTitle: '模型参数配置',
    displayNameLabel: '显示名称 (重命名模型)',
    systemPromptLabel: '专属系统提示词',
    systemPromptBadge: '仅对本模型生效',
    systemPromptPlaceholder: '此模型的自定义指令（将覆盖全局提示词）...',
    temperatureLabel: '温度 (创造力)',
    temperatureDesc: '较低值 = 严谨准确，较高值 = 富有创意与多样性',
    maxTokensLabel: '最大输出 Token',
    topPLabel: 'Top-P 采样',
    resetDefaults: '重置为默认值',
    saveParameters: '保存参数',
    saved: '已保存！',

    addCustomModelTitle: '添加自定义模型',
    addCustomModelSub: 'GGUF / ONNX / safetensors 或本地 Ollama 服务',
    tabModelFile: '模型文件 (GGUF / ONNX)',
    tabOllama: '本地服务 (Ollama / LM Studio)',
    chooseModelFile: '选择模型文件 (.gguf, .onnx, .safetensors)...',
    modelNameLabel: '聊天中的模型名称',
    endpointLabel: 'API 接口地址',
    addModelBtn: '添加模型',
    copyAppDataNotice: '文件将被注册至本地模型注册表',

    hfTitle: 'Hugging Face 直连与检索',
    hfSearchPlaceholder: '搜索 HuggingFace 文本生成 / GGUF 模型...',
    hfDirectRepoLabel: '直接输入 Repo ID (例如 TheBloke/Llama-2-7B-GGUF):',
    hfAddRepoBtn: '添加该仓库',
    hfFilterAll: '全部',
    hfFilterGguf: '仅 GGUF',
    hfFilterTextGen: '文本生成',
    hfAdded: '已添加',
    hfAdd: '添加',
    hfDownloads: '下载量',

    transferAlertHeader: '跨设备转移保护',
    transferAlertTitle: '检测到数据文件被迁移',
    transferAlertDesc: '提示：检测到数据文件被移动至新设备或存储位置！请输入安全密码以解锁。',
    transferPasswordLabel: '解密密码',
    transferPasswordPlaceholder: '输入安全密码...',
    transferUnlockBtn: '解锁数据',
    transferTooManyAttempts: '尝试次数过多，请等待 5 分钟',
    transferInvalidPassword: '密码错误。剩余尝试次数：',
  },
};

export function getTranslation(lang: AppLanguage = 'ru'): Translations {
  return TRANSLATIONS[lang] || TRANSLATIONS.ru;
}
