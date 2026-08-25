import React, { useState } from 'react';
import { X, Terminal, Trash2, Download, Filter, Info, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LogEntry } from '../types';
import { getContrastColor } from '../utils/color';

interface ConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  onClearLogs: () => void;
  accentColor: string;
}

export const ConsoleModal: React.FC<ConsoleModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
  accentColor,
}) => {
  const [filterLevel, setFilterLevel] = useState<'all' | 'info' | 'warn' | 'error' | 'api'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    if (filterLevel !== 'all' && log.level !== filterLevel) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        log.source.toLowerCase().includes(q) ||
        (log.details && JSON.stringify(log.details).toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExportLogs = () => {
    const text = logs
      .map(
        (l) =>
          `[${new Date(l.timestamp).toISOString()}] [${l.level.toUpperCase()}] [${l.source}]: ${l.message} ${
            l.details ? JSON.stringify(l.details) : ''
          }`
      )
      .join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatox_console_logs_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelBadge = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-red-300 bg-red-950/80 border border-red-500/40 rounded-md">
            <AlertCircle className="w-3 h-3" /> ERR
          </span>
        );
      case 'warn':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-yellow-300 bg-yellow-950/80 border border-yellow-500/40 rounded-md">
            <AlertTriangle className="w-3 h-3" /> WARN
          </span>
        );
      case 'api':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-purple-300 bg-purple-950/80 border border-purple-500/40 rounded-md">
            <Sparkles className="w-3 h-3" /> API
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 rounded-md">
            <Info className="w-3 h-3" /> INFO
          </span>
        );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-4xl h-[92vh] sm:h-[80vh] flex flex-col overflow-hidden border rounded-2xl sm:rounded-3xl shadow-[0_0_70px_rgba(138,43,226,0.3)] text-neutral-100"
          style={{
            backgroundColor: 'var(--panel-bg)',
            borderColor: `${accentColor}50`,
            boxShadow: `0 0 80px ${accentColor}30`,
          }}
        >
          {/* Top header bar */}
          <div
            className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-white/10"
            style={{ backgroundColor: 'var(--panel-card-bg)' }}
          >
            {/* Top-left close button as explicitly requested in prompt */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                id="console-close-btn"
                onClick={onClose}
                className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 text-neutral-400 transition-colors border rounded-xl border-white/10 hover:bg-white/10 hover:text-white shrink-0"
                title="Закрыть консоль"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0" />
                <h3 className="text-xs sm:text-base font-semibold tracking-wide text-white truncate">
                  Консоль CHATOX AI
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                id="console-clear-btn"
                onClick={onClearLogs}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-neutral-300 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                title="Очистить журнал"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Очистить</span>
              </button>

              <button
                id="console-export-btn"
                onClick={handleExportLogs}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-purple-300 border border-purple-500/30 bg-purple-950/40 rounded-lg hover:bg-purple-900/50 transition-colors shadow-[0_0_12px_rgba(138,43,226,0.3)]"
                title="Скачать файл логов"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Экспорт</span>
              </button>
            </div>
          </div>

          {/* Filter and search toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 px-3 sm:px-6 py-2.5 sm:py-3 border-b border-white/5 bg-black/20 text-xs">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <Filter className="w-3.5 h-3.5 text-neutral-400 mr-1 shrink-0" />
              {(['all', 'info', 'api', 'warn', 'error'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-2.5 py-1 rounded-md font-medium text-[11px] uppercase tracking-wider transition-all shrink-0 ${
                    filterLevel === lvl
                      ? 'shadow-md border'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5 border border-transparent'
                  }`}
                  style={
                    filterLevel === lvl
                      ? {
                          backgroundColor: accentColor,
                          borderColor: `${accentColor}80`,
                          color: getContrastColor(accentColor),
                          boxShadow: `0 0 12px ${accentColor}60`,
                        }
                      : {}
                  }
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-56">
              <input
                id="console-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по логам..."
                className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 text-xs"
              />
            </div>
          </div>

          {/* Logs body */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2 bg-black/70 scrollbar-thin">
            {filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500 py-12">
                <Terminal className="w-8 h-8 mb-2 opacity-40" />
                <p>Нет записей в журнале</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-[#110e20]/80 border border-white/5 hover:border-purple-500/30 transition-colors"
                >
                  <span className="text-neutral-500 select-none whitespace-nowrap pt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <div className="shrink-0">{getLevelBadge(log.level)}</div>
                  <span className="text-purple-400 font-semibold whitespace-nowrap pt-0.5">
                    [{log.source}]
                  </span>
                  <div className="flex-1 text-neutral-200 break-words leading-relaxed">
                    {log.message}
                    {log.details && (
                      <pre className="mt-1.5 p-2 rounded bg-black/80 text-[11px] text-purple-300 overflow-x-auto border border-purple-500/20">
                        {typeof log.details === 'string'
                          ? log.details
                          : JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
