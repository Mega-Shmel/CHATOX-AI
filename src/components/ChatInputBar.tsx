import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  Sparkles,
  ChevronDown,
  Search,
  Check,
  Cpu,
  Zap,
  Sliders,
} from 'lucide-react';
import { ModelOption, Attachment } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { getContrastColor } from '../utils/color';

interface ChatInputBarProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  activeModel: ModelOption;
  availableModels: ModelOption[];
  onSelectModel: (model: ModelOption) => void;
  isListening: boolean;
  onToggleVoice: () => void;
  attachments: Attachment[];
  onAddAttachment: (att: Attachment) => void;
  onRemoveAttachment: (index: number) => void;
  useSimpleNames: boolean;
  accentColor: string;
  onOpenSettings?: () => void;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  inputText,
  onInputChange,
  onSendMessage,
  isLoading,
  activeModel,
  availableModels,
  onSelectModel,
  isListening,
  onToggleVoice,
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  useSimpleNames,
  accentColor,
  onOpenSettings,
}) => {
  const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close model picker on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsModelPickerOpen(false);
      }
    };
    if (isModelPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModelPickerOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();

      if (isImage) {
        reader.onload = (ev) => {
          onAddAttachment({
            name: file.name,
            size: file.size,
            type: file.type,
            base64Data: ev.target?.result as string,
          });
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = (ev) => {
          onAddAttachment({
            name: file.name,
            size: file.size,
            type: file.type,
            textData: (ev.target?.result as string) || '',
          });
        };
        reader.readAsText(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Ensure unique models in picker
  const uniqueAvailableModels = availableModels.filter(
    (m, idx, self) => idx === self.findIndex((t) => t.id === m.id)
  );

  const filteredModels = uniqueAvailableModels.filter((m) => {
    const q = modelSearch.toLowerCase();
    const displayName = useSimpleNames ? m.simpleName : m.name;
    const provider = useSimpleNames ? m.simpleProviderName : m.providerName;
    return (
      displayName.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      provider.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q)
    );
  });

  const activeDisplayName = useSimpleNames ? activeModel.simpleName : activeModel.name;
  const activeProviderDisplay = useSimpleNames
    ? activeModel.simpleProviderName
    : activeModel.providerName;

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 pb-3 sm:pb-5 pt-1.5 sm:pt-2 flex flex-col gap-2 z-20 relative">
      {/* Model Picker & Controls Bar */}
      <div className="flex items-center justify-between gap-2 px-1">
        {/* Active Model Selector Button */}
        <div className="relative" ref={pickerRef}>
          <button
            id="active-model-picker-btn"
            type="button"
            onClick={() => setIsModelPickerOpen(!isModelPickerOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-[#120f24]/90 text-xs font-medium text-white transition-all backdrop-blur-md group border max-w-[85vw] sm:max-w-none"
            style={{
              borderColor: `${accentColor}50`,
              boxShadow: `0 0 15px ${accentColor}25`,
            }}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0" />
            <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
            <span className="font-semibold truncate">{activeDisplayName}</span>
            <span className="text-[10px] sm:text-[11px] text-neutral-400 px-1.5 py-0.5 rounded bg-white/5 border border-white/5 shrink-0 hidden xs:inline">
              {activeProviderDisplay}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 shrink-0 ${
                isModelPickerOpen ? 'rotate-180' : ''
              }`}
              style={isModelPickerOpen ? { color: accentColor } : {}}
            />
          </button>

          {/* Vertical Model Selector Dropdown Popover */}
          <AnimatePresence>
            {isModelPickerOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-x-2 bottom-20 sm:absolute sm:inset-auto sm:bottom-full sm:left-0 mb-2 w-auto sm:w-96 max-h-[460px] bg-[#0c0a18] rounded-2xl shadow-2xl backdrop-blur-2xl flex flex-col z-50 overflow-hidden text-neutral-100 border"
                style={{
                  borderColor: `${accentColor}60`,
                  boxShadow: `0 0 50px ${accentColor}35`,
                }}
              >
                {/* Search Header */}
                <div className="p-3 border-b border-white/10 bg-black/40">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                      placeholder="Поиск по активным моделям..."
                      className="w-full pl-9 pr-3 py-2 bg-black/60 border rounded-xl text-white placeholder-neutral-500 text-xs focus:outline-none"
                      style={{
                        borderColor: `${accentColor}40`,
                      }}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Vertical Model List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[300px] scrollbar-thin">
                  {filteredModels.length === 0 ? (
                    <div className="py-8 text-center text-xs text-neutral-400">
                      Модели по запросу не найдены
                    </div>
                  ) : (
                    filteredModels.map((m) => {
                      const isSelected = activeModel.id === m.id;
                      const mDisplayName = useSimpleNames ? m.simpleName : m.name;
                      const mProviderName = useSimpleNames
                        ? m.simpleProviderName
                        : m.providerName;

                      return (
                        <button
                          key={`picker-model-${m.id}`}
                          onClick={() => {
                            onSelectModel(m);
                            setIsModelPickerOpen(false);
                          }}
                          className="w-full text-left p-2.5 rounded-xl border transition-all flex items-start justify-between gap-2.5"
                          style={
                            isSelected
                              ? {
                                  backgroundColor: `${accentColor}25`,
                                  borderColor: `${accentColor}70`,
                                  boxShadow: `0 0 15px ${accentColor}30`,
                                }
                              : {
                                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                  borderColor: 'rgba(255, 255, 255, 0.05)',
                                }
                          }
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-bold truncate ${
                                  isSelected ? 'text-white' : 'text-neutral-200'
                                }`}
                              >
                                {mDisplayName}
                              </span>
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded-md border font-medium"
                                style={{
                                  backgroundColor: `${accentColor}20`,
                                  borderColor: `${accentColor}40`,
                                  color: '#ffffff',
                                }}
                              >
                                {mProviderName}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                              {m.description}
                            </p>
                          </div>
                          {isSelected ? (
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm border"
                              style={{
                                backgroundColor: accentColor,
                                borderColor: '#ffffff',
                              }}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          ) : null}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Footer with settings shortcut */}
                {onOpenSettings && (
                  <div className="p-2.5 border-t border-white/10 bg-black/40 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400">
                      Активно моделей: {availableModels.length}
                    </span>
                    <button
                      onClick={() => {
                        setIsModelPickerOpen(false);
                        onOpenSettings();
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-white rounded-lg transition-all border"
                      style={{
                        backgroundColor: `${accentColor}25`,
                        borderColor: `${accentColor}50`,
                      }}
                    >
                      <Sliders className="w-3 h-3" style={{ color: accentColor }} />
                      <span>Управление моделями</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Available model count badge */}
        <span className="text-[11px] text-neutral-400 hidden sm:inline-block">
          Моделей доступно: {availableModels.length}
        </span>
      </div>

      {/* Attachment chips */}
      {attachments.length > 0 && (
        <div
          className="flex flex-wrap gap-2 p-2 bg-black/60 rounded-2xl border"
          style={{ borderColor: `${accentColor}30` }}
        >
          {attachments.map((att, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs text-neutral-200"
              style={{
                backgroundColor: `${accentColor}20`,
                borderColor: `${accentColor}50`,
              }}
            >
              {att.type.startsWith('image/') ? (
                <ImageIcon className="w-3.5 h-3.5" style={{ color: accentColor }} />
              ) : (
                <FileText className="w-3.5 h-3.5" style={{ color: accentColor }} />
              )}
              <span className="truncate max-w-[160px]">{att.name}</span>
              <button
                onClick={() => onRemoveAttachment(idx)}
                className="text-neutral-400 hover:text-red-400 transition-colors ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input container with Voice, Attachment, Textarea, Send */}
      <div
        className="relative flex items-center gap-2 p-2 rounded-2xl bg-[#0e0c1a]/90 backdrop-blur-xl transition-all border"
        style={{
          borderColor: `${accentColor}50`,
          boxShadow: `0 0 30px ${accentColor}25`,
        }}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Button 1: Voice Input */}
        <button
          id="chat-voice-btn"
          type="button"
          onClick={onToggleVoice}
          className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all border shrink-0 ${
            isListening
              ? 'bg-red-600 text-white border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse'
              : 'bg-black/40 text-neutral-300 border-white/10 hover:text-white hover:bg-white/10'
          }`}
          title={isListening ? 'Идет голосовой ввод (нажмите для остановки)' : 'Голосовой ввод (распознавание речи)'}
        >
          <Mic className="w-5 h-5" />
        </button>

        {/* Button 2: File Attachment */}
        <button
          id="chat-attach-btn"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-black/40 text-neutral-300 border border-white/10 hover:text-white hover:bg-white/10 transition-all shrink-0"
          title="Загрузка файла к запросу"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Text input area */}
        <textarea
          id="chat-message-input"
          rows={1}
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          inputMode="text"
          autoCapitalize="sentences"
          autoCorrect="on"
          spellCheck={true}
          lang="ru"
          placeholder="Введите сообщение для нейросети..."
          className="flex-1 bg-transparent text-white placeholder-neutral-500 text-sm md:text-base px-2 py-2 resize-none max-h-32 focus:outline-none scrollbar-thin"
        />

        {/* Button 3: Send message */}
        <button
          id="chat-send-btn"
          type="button"
          onClick={onSendMessage}
          disabled={isLoading || (!inputText.trim() && attachments.length === 0)}
          className="flex items-center justify-center w-11 h-11 rounded-xl font-bold border active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
          style={{
            backgroundColor: accentColor,
            borderColor: `${accentColor}80`,
            color: getContrastColor(accentColor),
            boxShadow: `0 0 25px ${accentColor}80`,
          }}
          title="Отправить сообщение"
        >
          <Send className="w-5 h-5 ml-0.5" />
        </button>
      </div>
    </div>
  );
};

