import React, { useEffect, useRef } from 'react';
import {
  MessageSquare,
  MoreVertical,
  Terminal,
  Settings,
  Bot,
  User,
  Copy,
  Check,
  Sparkles,
  Volume2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, ModelOption, AppLanguage } from '../types';
import { getContrastColor } from '../utils/color';
import { getTranslation } from '../i18n/translations';

interface ChatAreaProps {
  messages: ChatMessage[];
  userName: string;
  activeModel: ModelOption;
  onOpenDrawer: () => void;
  onOpenConsole: () => void;
  onOpenSettings: () => void;
  isDotsMenuOpen: boolean;
  onToggleDotsMenu: () => void;
  accentColor: string;
  language?: AppLanguage;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  userName,
  activeModel,
  onOpenDrawer,
  onOpenConsole,
  onOpenSettings,
  isDotsMenuOpen,
  onToggleDotsMenu,
  accentColor,
  language = 'ru',
}) => {
  const t = getTranslation(language);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'zh' ? 'zh-CN' : language === 'en' ? 'en-US' : 'ru-RU';
      window.speechSynthesis.speak(utterance);
    }
  };

  const greetingText =
    userName && userName !== 'Skipped'
      ? t.greetingHello.replace('{name}', userName)
      : t.greetingDefault;

  return (
    <div className="relative flex-1 flex flex-col w-full h-full overflow-hidden">
      {/* Top action header bar */}
      <header className="relative z-30 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-white/5 bg-black/30 backdrop-blur-lg">
        {/* Top-left: Chat History button */}
        <button
          id="top-chats-btn"
          onClick={onOpenDrawer}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-white text-xs font-semibold transition-all active:scale-95 border shrink-0"
          style={{
            backgroundColor: `${accentColor}25`,
            borderColor: `${accentColor}60`,
            boxShadow: `0 0 15px ${accentColor}30`,
          }}
          title={t.openChatList}
        >
          <MessageSquare className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
          <span className="hidden sm:inline">{t.chatsBtn}</span>
        </button>

        {/* Center title or active model indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 max-w-[50%] sm:max-w-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399] shrink-0" />
          <span
            className="text-[11px] sm:text-xs font-bold tracking-wider uppercase font-mono truncate"
            style={{ color: accentColor }}
          >
            CHATOX AI &bull; {activeModel.name}
          </span>
        </div>

        {/* Top-right: Morphing 3 Dots menu */}
        <div className="relative shrink-0">
          <button
            id="top-dots-btn"
            onClick={onToggleDotsMenu}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border transition-all"
            style={
              isDotsMenuOpen
                ? {
                    backgroundColor: accentColor,
                    color: getContrastColor(accentColor),
                    borderColor: `${accentColor}80`,
                    boxShadow: `0 0 20px ${accentColor}80`,
                  }
                : {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#d4d4d4',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  }
            }
            title={t.appMenu}
          >
            <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Morphing smooth dropdown for Console and Settings */}
          <AnimatePresence>
            {isDotsMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ type: 'spring', damping: 22, stiffness: 350 }}
                className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl bg-[#0d0a1c] border shadow-2xl p-1.5 z-50 text-xs font-medium"
                style={{
                  borderColor: `${accentColor}60`,
                  boxShadow: `0 0 35px ${accentColor}40`,
                }}
              >
                <button
                  id="menu-console-btn"
                  onClick={() => {
                    onToggleDotsMenu();
                    onOpenConsole();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-neutral-200 hover:text-white transition-all"
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${accentColor}25`)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Terminal className="w-4 h-4" style={{ color: accentColor }} />
                  <span>{t.consoleLogs}</span>
                </button>

                <button
                  id="menu-settings-btn"
                  onClick={() => {
                    onToggleDotsMenu();
                    onOpenSettings();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-neutral-200 hover:text-white transition-all"
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${accentColor}25`)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Settings className="w-4 h-4" style={{ color: accentColor }} />
                  <span>{t.settings}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main scrollable chat viewport */}
      <div className="flex-1 overflow-y-auto px-2.5 sm:px-6 md:px-8 py-3.5 sm:py-6 space-y-4 sm:space-y-6 scrollbar-thin">
        {messages.length === 0 ? (
          /* Empty state: Centered greeting banner */
          <div className="flex flex-col items-center justify-center min-h-[55vh] sm:min-h-[60vh] text-center px-3 sm:px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative mb-4 sm:mb-6"
            >
              {/* Background radiant neon circle */}
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-40 animate-pulse"
                style={{ backgroundColor: accentColor }}
              />
              <div
                className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 border rounded-2xl sm:rounded-3xl bg-[#090812]"
                style={{
                  borderColor: `${accentColor}60`,
                  boxShadow: `0 0 40px ${accentColor}50`,
                }}
              >
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" style={{ color: accentColor }} />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xl sm:text-2xl md:text-4xl font-extrabold tracking-tight text-white mb-2 sm:mb-3"
            >
              {greetingText}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-xs sm:text-sm md:text-base text-neutral-400 max-w-md leading-relaxed px-2"
            >
              {t.greetingSub}{' '}
              <span className="font-semibold" style={{ color: accentColor }}>
                {activeModel.name}
              </span>.
            </motion.p>
          </div>
        ) : (
          /* Messages list */
          <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-5">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const userTextColor = getContrastColor(accentColor);
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 sm:gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div
                      className="flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl border shrink-0 mt-1 shadow-lg"
                      style={{
                        backgroundColor: `${accentColor}20`,
                        borderColor: `${accentColor}50`,
                        color: accentColor,
                        boxShadow: `0 0 15px ${accentColor}30`,
                      }}
                    >
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  )}

                  <div className={`max-w-[90%] sm:max-w-[82%] md:max-w-[75%] space-y-1.5 sm:space-y-2`}>
                    {/* Message Bubble */}
                    <div
                      className={`relative p-3.5 sm:p-4 md:p-5 rounded-2xl text-xs sm:text-sm md:text-base leading-relaxed break-words ${
                        isUser
                          ? 'rounded-br-sm border font-medium'
                          : 'bg-[#110d24]/90 text-neutral-100 rounded-bl-sm border backdrop-blur-md shadow-lg'
                      }`}
                      style={
                        isUser
                          ? {
                              backgroundColor: accentColor,
                              color: userTextColor,
                              borderColor: `${accentColor}80`,
                              boxShadow: `0 0 25px ${accentColor}50`,
                            }
                          : {
                              borderColor: `${accentColor}30`,
                            }
                      }
                    >
                      {/* Attachments preview */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {msg.attachments.map((att, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs ${
                                isUser
                                  ? 'bg-black/20 border border-black/10'
                                  : 'bg-black/40 border border-white/20 text-white'
                              }`}
                              style={isUser ? { color: userTextColor } : {}}
                            >
                              {att.type.startsWith('image/') ? (
                                <ImageIcon
                                  className="w-3.5 h-3.5"
                                  style={{ color: isUser ? userTextColor : accentColor }}
                                />
                              ) : (
                                <FileText
                                  className="w-3.5 h-3.5"
                                  style={{ color: isUser ? userTextColor : accentColor }}
                                />
                              )}
                              <span className="truncate max-w-[140px]">{att.name}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Content rendering */}
                      {isUser ? (
                        <p className="whitespace-pre-wrap" style={{ color: userTextColor }}>
                          {msg.content}
                        </p>
                      ) : (
                        <div className="markdown-body prose prose-invert max-w-none text-neutral-200">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                          {msg.status === 'streaming' && (
                            <span
                              className="inline-block w-2 h-4 ml-1 animate-pulse"
                              style={{ backgroundColor: accentColor }}
                            />
                          )}
                        </div>
                      )}

                      {/* Error state */}
                      {msg.status === 'error' && (
                        <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-red-950/60 border border-red-500/40 text-xs text-red-300">
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                          <span>{msg.errorDetails || t.generationError}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom message info bar & copy button */}
                    <div
                      className={`flex items-center gap-3 px-1 text-[11px] text-neutral-500 ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {msg.modelName && <span>&bull; {msg.modelName}</span>}

                      {!isUser && (
                        <>
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="flex items-center gap-1 hover:text-white transition-colors"
                            title={t.copyMessage}
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedId === msg.id ? t.copied : t.copy}</span>
                          </button>

                          <button
                            onClick={() => handleSpeak(msg.content)}
                            className="flex items-center gap-1 hover:text-white transition-colors"
                            title={t.speak}
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>{t.speak}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div
                      className="flex items-center justify-center w-9 h-9 rounded-2xl border shrink-0 mt-1 shadow-md"
                      style={{
                        backgroundColor: `${accentColor}40`,
                        borderColor: `${accentColor}70`,
                        color: userTextColor,
                      }}
                    >
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};
