import React, { useState } from 'react';
import {
  X,
  Plus,
  MessageSquare,
  Search,
  Trash2,
  Download,
  Lock,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatSession } from '../types';
import { getContrastColor } from '../utils/color';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chats: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onExportChat: (id: string) => void;
  maxSavedChats: number;
  isEncrypted: boolean;
  accentColor: string;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onExportChat,
  maxSavedChats,
  isEncrypted,
  accentColor,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dimmed Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-md transition-opacity"
          />

          {/* Left Slide-out Drawer */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-80 md:w-96 border-r shadow-2xl flex flex-col text-neutral-100 p-5"
            style={{
              backgroundColor: 'var(--panel-bg)',
              borderColor: `${accentColor}40`,
              boxShadow: `0 0 80px ${accentColor}30`,
            }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-xl border"
                  style={{
                    backgroundColor: `${accentColor}25`,
                    borderColor: `${accentColor}50`,
                    color: accentColor,
                  }}
                >
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Сохраненные чаты</h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                    <span>{chats.length} из {maxSavedChats} слотов</span>
                    {isEncrypted && (
                      <span className="flex items-center gap-0.5 font-mono" style={{ color: accentColor }}>
                        <Lock className="w-3 h-3" /> AES-256
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                id="chat-drawer-close-btn"
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 text-neutral-400 transition-colors border rounded-xl border-white/10 hover:bg-white/10 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* New Chat Button */}
            <button
              id="drawer-new-chat-btn"
              onClick={() => {
                onNewChat();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 mb-4 rounded-xl font-semibold text-sm border active:scale-98 transition-all"
              style={{
                backgroundColor: accentColor,
                borderColor: `${accentColor}80`,
                color: getContrastColor(accentColor),
                boxShadow: `0 0 20px ${accentColor}60`,
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Новый чат</span>
            </button>

            {/* Search chats */}
            <div className="relative mb-4">
              <Search className="absolute w-3.5 h-3.5 -translate-y-1/2 left-3 top-1/2 text-neutral-400" />
              <input
                id="chat-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по сохраненным диалогам..."
                className="w-full pl-9 pr-3 py-2 bg-black/60 border rounded-xl text-white placeholder-neutral-500 text-xs focus:outline-none"
                style={{
                  borderColor: `${accentColor}40`,
                }}
              />
            </div>

            {/* Scrollable chat list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-neutral-500 text-xs text-center px-4">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
                  <p>Нет сохраненных чатов</p>
                  <p className="text-[11px] text-neutral-600 mt-1">
                    Начните диалог, и он автоматически зашифруется в хранилище
                  </p>
                </div>
              ) : (
                filteredChats.map((chat) => {
                  const isActive = chat.id === activeChatId;
                  return (
                    <div
                      key={chat.id}
                      onClick={() => {
                        onSelectChat(chat.id);
                        onClose();
                      }}
                      className="group relative flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all"
                      style={
                        isActive
                          ? {
                              backgroundColor: `${accentColor}25`,
                              borderColor: `${accentColor}70`,
                              boxShadow: `0 0 15px ${accentColor}30`,
                            }
                          : {
                              backgroundColor: 'rgba(0, 0, 0, 0.4)',
                              borderColor: 'rgba(255, 255, 255, 0.05)',
                            }
                      }
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1 pr-2">
                        <MessageSquare
                          className="w-4 h-4 mt-0.5 shrink-0"
                          style={isActive ? { color: accentColor } : { color: '#737373' }}
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate">
                            {chat.title || 'Новый чат'}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-neutral-400">
                            <span>{chat.messages.length} сообщ.</span>
                            <span>&bull;</span>
                            <span>
                              {new Date(chat.updatedAt).toLocaleDateString([], {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Hover action icons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onExportChat(chat.id);
                          }}
                          className="p-1 text-neutral-400 hover:text-white rounded hover:bg-white/10"
                          title="Экспорт чата в .json / .txt"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat.id);
                          }}
                          className="p-1 text-neutral-400 hover:text-red-400 rounded hover:bg-white/10"
                          title="Удалить чат"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer status */}
            <div className="pt-3 border-t border-white/10 text-[11px] text-neutral-500 text-center">
              CHATOX Encrypted Vault v1.0
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
