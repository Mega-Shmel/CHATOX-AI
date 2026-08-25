import React, { useState, useEffect } from 'react';
import { X, Smile, Search, Plus, Check, Download, Heart, Tag, RefreshCw, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomModelItem } from '../types';
import { getContrastColor } from '../utils/color';

interface HuggingFaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddModel: (model: CustomModelItem) => void;
  accentColor: string;
}

interface HFModelItem {
  id: string;
  name: string;
  author: string;
  downloads: number;
  likes: number;
  pipeline_tag?: string;
  tags?: string[];
  isGGUF?: boolean;
}

export const HuggingFaceModal: React.FC<HuggingFaceModalProps> = ({
  isOpen,
  onClose,
  onAddModel,
  accentColor,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customRepoId, setCustomRepoId] = useState('');
  const [models, setModels] = useState<HFModelItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'gguf' | 'text-gen'>('gguf');

  const fetchHFModels = async (query: string = '') => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch via backend proxy first
      const res = await fetch(`/api/huggingface/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.models) && data.models.length > 0) {
          setModels(data.models);
          setIsLoading(false);
          return;
        }
      }

      // Direct client-side fetch fallback to Hugging Face Hub API
      const directUrl = query.trim()
        ? `https://huggingface.co/api/models?search=${encodeURIComponent(query.trim())}&limit=30&full=true`
        : `https://huggingface.co/api/models?pipeline_tag=text-generation&sort=downloads&direction=-1&limit=30&full=true`;

      const directRes = await fetch(directUrl);
      if (directRes.ok) {
        const raw = await directRes.json();
        const formatted: HFModelItem[] = (Array.isArray(raw) ? raw : []).map((m: any) => ({
          id: m.id || m._id,
          name: m.id ? m.id.split('/')[1] || m.id : 'Model',
          author: m.id ? m.id.split('/')[0] : 'Community',
          downloads: m.downloads || 0,
          likes: m.likes || 0,
          pipeline_tag: m.pipeline_tag || 'text-generation',
          tags: Array.isArray(m.tags) ? m.tags.slice(0, 5) : [],
          isGGUF: Array.isArray(m.tags) && m.tags.some((t: string) => t.toLowerCase().includes('gguf')),
        }));
        setModels(formatted);
      } else {
        setError('Не удалось загрузить список моделей с Hugging Face');
      }
    } catch (e: any) {
      setError('Ошибка прямого подключения к Hugging Face API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHFModels('');
    }
  }, [isOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHFModels(searchQuery);
  };

  if (!isOpen) return null;

  const handleAdd = (repoId: string, customName?: string) => {
    const rawName = customName || repoId.split('/')[1] || repoId;
    const cleanName = rawName.replace(/\.gguf$/i, '').replace(/\.onnx$/i, '');
    const item: CustomModelItem = {
      id: `hf/${repoId}`,
      name: cleanName,
      format: 'GGUF',
      enabled: true,
      addedAt: Date.now(),
    };
    onAddModel(item);
    setAddedIds((prev) => [...prev, repoId]);
  };

  const filteredModels = models.filter((m) => {
    if (activeFilter === 'gguf') {
      return m.isGGUF || m.id.toLowerCase().includes('gguf') || m.name.toLowerCase().includes('gguf');
    }
    return true;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-3xl overflow-hidden border rounded-3xl shadow-[0_0_60px_rgba(138,43,226,0.35)] text-neutral-100 p-6 flex flex-col max-h-[88vh]"
          style={{
            backgroundColor: 'var(--panel-bg)',
            borderColor: `${accentColor}50`,
            boxShadow: `0 0 80px ${accentColor}30`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 border rounded-2xl bg-amber-500/20 border-amber-500/40 text-amber-300">
                <Smile className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Прямое подключение к Hugging Face</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
                    Live API Hub
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  Поиск и прямое добавление открытых моделей и GGUF-репозиториев
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 text-neutral-400 transition-colors border rounded-xl border-white/10 hover:bg-white/10 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="space-y-3 mb-4">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute w-4 h-4 -translate-y-1/2 left-3.5 top-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по Hugging Face Hub (например: Qwen2.5 GGUF, Llama-3.3, Mistral, DeepSeek)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-purple-500/30 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400 text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg transition-all disabled:opacity-50 shrink-0 border"
                style={{
                  backgroundColor: accentColor,
                  borderColor: `${accentColor}80`,
                  color: getContrastColor(accentColor),
                  boxShadow: `0 0 15px ${accentColor}50`,
                }}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Найти</span>
              </button>
            </form>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-400">Фильтр:</span>
              <button
                onClick={() => setActiveFilter('gguf')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeFilter === 'gguf'
                    ? 'bg-purple-950/70 border border-purple-500 text-purple-200'
                    : 'bg-black/40 border border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                GGUF / Квантованные
              </button>
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeFilter === 'all'
                    ? 'bg-purple-950/70 border border-purple-500 text-purple-200'
                    : 'bg-black/40 border border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                Все текстовые модели
              </button>
            </div>
          </div>

          {/* Model list direct live results */}
          <div className="flex-1 pr-1 overflow-y-auto space-y-2.5 max-h-[42vh] scrollbar-thin">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-400 gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                <span className="text-xs">Загрузка репозиториев напрямую с Hugging Face...</span>
              </div>
            ) : error ? (
              <div className="p-4 border rounded-2xl bg-red-950/20 border-red-500/30 text-xs text-red-300 text-center">
                {error}
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="py-10 text-center text-xs text-neutral-400">
                Модели не найдены. Попробуйте изменить поисковый запрос (например "DeepSeek GGUF", "Llama").
              </div>
            ) : (
              filteredModels.map((model) => {
                const isAdded = addedIds.includes(model.id);
                return (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-3.5 border rounded-2xl bg-purple-950/15 border-white/5 hover:border-purple-500/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1 mr-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white truncate">{model.name}</h4>
                        {model.isGGUF && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 font-mono">
                            GGUF
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {model.author}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-purple-400/80 truncate mt-0.5">
                        {model.id}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3 text-neutral-500" />
                          {model.downloads.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-pink-500/70" />
                          {model.likes.toLocaleString()}
                        </span>
                        {model.tags && model.tags.length > 0 && (
                          <span className="truncate text-neutral-500">
                            {model.tags.slice(0, 3).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => !isAdded && handleAdd(model.id, model.name)}
                      disabled={isAdded}
                      className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all shrink-0 ${
                        isAdded
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 cursor-default'
                          : 'border shadow-md'
                      }`}
                      style={
                        !isAdded
                          ? {
                              backgroundColor: accentColor,
                              borderColor: `${accentColor}80`,
                              color: getContrastColor(accentColor),
                              boxShadow: `0 0 15px ${accentColor}50`,
                            }
                          : {}
                      }
                    >
                      {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{isAdded ? 'Добавлено' : 'Подключить'}</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Custom Repo ID direct connection */}
          <div className="pt-4 mt-4 border-t border-white/10">
            <label className="block mb-2 text-xs font-semibold tracking-wide uppercase text-neutral-400">
              Или укажите точный Repo ID с Hugging Face
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customRepoId}
                onChange={(e) => setCustomRepoId(e.target.value)}
                placeholder="organization/model-name (например: bartowski/DeepSeek-R1-Distill-Qwen-14B-GGUF)"
                className="flex-1 px-3.5 py-2.5 bg-black/60 border border-purple-500/30 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400 text-xs font-mono"
              />
              <button
                onClick={() => {
                  if (customRepoId.trim()) {
                    handleAdd(customRepoId.trim());
                    setCustomRepoId('');
                  }
                }}
                disabled={!customRepoId.trim()}
                className="px-4 py-2.5 text-xs font-semibold transition-all rounded-xl disabled:opacity-40 shadow-lg shrink-0 border"
                style={{
                  backgroundColor: accentColor,
                  borderColor: `${accentColor}80`,
                  color: getContrastColor(accentColor),
                  boxShadow: `0 0 15px ${accentColor}50`,
                }}
              >
                Подключить модель
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
