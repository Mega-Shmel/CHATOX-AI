import React, { useState, useRef } from 'react';
import { X, HardDrive, FolderPlus, Upload, Check, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomModelItem } from '../types';
import { getContrastColor } from '../utils/color';

interface CustomModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddModel: (model: CustomModelItem) => void;
  copyToAppData: boolean;
  accentColor: string;
}

export const CustomModelModal: React.FC<CustomModelModalProps> = ({
  isOpen,
  onClose,
  onAddModel,
  copyToAppData,
  accentColor,
}) => {
  const [modelType, setModelType] = useState<'file' | 'ollama'>('file');
  const [customName, setCustomName] = useState('');
  const [format, setFormat] = useState<'GGUF' | 'ONNX' | 'safetensors'>('GGUF');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [ollamaEndpoint, setOllamaEndpoint] = useState('http://localhost:11434/api/generate');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      // Strictly extract file name without extension
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setCustomName(nameWithoutExt);
      if (file.name.endsWith('.gguf')) setFormat('GGUF');
      if (file.name.endsWith('.onnx')) setFormat('ONNX');
      if (file.name.endsWith('.safetensors')) setFormat('safetensors');
    }
  };

  const handleAdd = () => {
    if (!customName.trim()) return;

    if (modelType === 'file') {
      const item: CustomModelItem = {
        id: `local/${Date.now()}`,
        name: customName.trim(),
        filename: selectedFileName || `${customName}.${format.toLowerCase()}`,
        format: format,
        enabled: true,
        addedAt: Date.now(),
      };
      onAddModel(item);
    } else {
      const item: CustomModelItem = {
        id: `ollama/${Date.now()}`,
        name: customName.trim(),
        endpointUrl: ollamaEndpoint.trim(),
        format: 'API/Ollama',
        enabled: true,
        addedAt: Date.now(),
      };
      onAddModel(item);
    }

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg overflow-hidden border rounded-3xl shadow-2xl text-neutral-100 p-6"
          style={{
            backgroundColor: 'var(--panel-bg)',
            borderColor: `${accentColor}50`,
            boxShadow: `0 0 60px ${accentColor}30`,
          }}
        >
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center w-10 h-10 border rounded-2xl"
                style={{
                  backgroundColor: `${accentColor}25`,
                  borderColor: `${accentColor}50`,
                  color: accentColor,
                }}
              >
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Добавить свою модель</h3>
                <p className="text-xs text-neutral-400">
                  GGUF / ONNX / safetensors или локальный сервер Ollama
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

          {/* Type selector tabs */}
          <div className="flex p-1 mb-4 border rounded-xl bg-black/50 border-white/10">
            <button
              onClick={() => setModelType('file')}
              className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
              style={
                modelType === 'file'
                  ? {
                      backgroundColor: accentColor,
                      color: getContrastColor(accentColor),
                      boxShadow: `0 0 15px ${accentColor}60`,
                    }
                  : { color: '#a3a3a3' }
              }
            >
              Файл модели (GGUF / ONNX)
            </button>
            <button
              onClick={() => setModelType('ollama')}
              className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
              style={
                modelType === 'ollama'
                  ? {
                      backgroundColor: accentColor,
                      color: getContrastColor(accentColor),
                      boxShadow: `0 0 15px ${accentColor}60`,
                    }
                  : { color: '#a3a3a3' }
              }
            >
              Локальный эндпоинт (Ollama)
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 text-xs font-medium text-neutral-300">
                Отображаемое имя модели (берется из имени файла)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Имя модели без расширения..."
                className="w-full px-3.5 py-2.5 bg-black/60 border rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none"
                style={{ borderColor: `${accentColor}40` }}
              />
            </div>

            {modelType === 'file' ? (
              <>
                <div>
                  <label className="block mb-1.5 text-xs font-medium text-neutral-300">
                    Формат весов
                  </label>
                  <div className="flex gap-2">
                    {(['GGUF', 'ONNX', 'safetensors'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setFormat(fmt)}
                        className="flex-1 py-2 text-xs font-bold rounded-lg border transition-all"
                        style={
                          format === fmt
                            ? {
                                borderColor: `${accentColor}80`,
                                backgroundColor: `${accentColor}25`,
                                color: '#ffffff',
                              }
                            : {
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                color: '#a3a3a3',
                              }
                        }
                      >
                        .{fmt.toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5 text-xs font-medium text-neutral-300">
                    Выбор файла через проводник
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".gguf,.onnx,.safetensors,.bin"
                    onChange={handleFileSelected}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-6 border border-dashed rounded-2xl bg-black/40 cursor-pointer transition-colors"
                    style={{
                      borderColor: `${accentColor}50`,
                    }}
                  >
                    <FolderPlus className="w-8 h-8 mb-2" style={{ color: accentColor }} />
                    <span className="text-xs font-medium text-white">
                      {selectedFileName || 'Нажмите для открытия проводника файлов'}
                    </span>
                    <span className="text-[11px] text-neutral-500 mt-1">
                      Поддерживаются .gguf, .onnx, .safetensors
                    </span>
                  </div>
                </div>

                {copyToAppData && (
                  <div
                    className="p-3 text-xs border rounded-xl"
                    style={{
                      backgroundColor: `${accentColor}20`,
                      borderColor: `${accentColor}40`,
                      color: '#ffffff',
                    }}
                  >
                    &bull; Опция "Копировать в AppData" включена: файл будет продублирован в защищенное хранилище приложения.
                  </div>
                )}
              </>
            ) : (
              <div>
                <label className="block mb-1.5 text-xs font-medium text-neutral-300">
                  URL локального сервера Ollama / vLLM
                </label>
                <input
                  type="text"
                  value={ollamaEndpoint}
                  onChange={(e) => setOllamaEndpoint(e.target.value)}
                  placeholder="http://localhost:11434/api/generate"
                  className="w-full px-3.5 py-2.5 bg-black/60 border rounded-xl text-white placeholder-neutral-500 text-xs font-mono focus:outline-none"
                  style={{ borderColor: `${accentColor}40` }}
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-medium border border-white/10 rounded-xl text-neutral-400 hover:bg-white/5"
              >
                Отмена
              </button>
              <button
                onClick={handleAdd}
                disabled={!customName.trim()}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold rounded-xl shadow-lg disabled:opacity-40 transition-all border"
                style={{
                  backgroundColor: accentColor,
                  borderColor: `${accentColor}80`,
                  color: getContrastColor(accentColor),
                  boxShadow: `0 0 20px ${accentColor}70`,
                }}
              >
                <Check className="w-4 h-4" />
                <span>Сохранить модель</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
