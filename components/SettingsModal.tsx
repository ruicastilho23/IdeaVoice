
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Upload, Trash2, Database, Check, AlertCircle, Globe } from 'lucide-react';
import { NoteData } from '../types';
import * as storage from '../services/storage';
import { blobToBase64, base64ToBlob } from '../utils';
import { translations, Language } from '../locales';

interface SettingsModalProps {
  onClose: () => void;
  onDataChanged: () => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  t: typeof translations.en.settingsModal;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onDataChanged, currentLanguage, onLanguageChange, t }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      setStatus('loading');
      setStatusMessage(t.status.loading);
      
      const notes = await storage.getNotes();
      
      // Convert blobs to base64 for JSON serialization
      const serializableNotes = await Promise.all(notes.map(async (note) => ({
        ...note,
        audioBase64: await blobToBase64(note.audioBlob),
        mimeType: note.audioBlob.type
      })));

      // Remove the blob objects from serialization (they become empty objects anyway)
      const dataToSave = serializableNotes.map(({ audioBlob, ...rest }) => rest);
      
      const jsonString = JSON.stringify(dataToSave, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `ideavoice_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus('success');
      setStatusMessage(t.status.backupSuccess);
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setStatusMessage(t.status.backupError);
    }
  };

  const handleImportTrigger = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setStatus('loading');
      setStatusMessage(t.status.loading);

      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) throw new Error("Invalid backup file format");

      // Optional: Clear existing data before import?
      // For now, let's just append/overwrite based on ID
      
      for (const item of data) {
        if (!item.id || !item.audioBase64 || !item.mimeType) {
            console.warn("Skipping invalid item", item);
            continue;
        }

        const note: NoteData = {
            id: item.id,
            createdAt: item.createdAt,
            duration: item.duration,
            title: item.title,
            transcription: item.transcription,
            summary: item.summary,
            keyPoints: item.keyPoints,
            tags: item.tags,
            actionItems: item.actionItems,
            isProcessing: false, // Ensure imported notes aren't stuck in processing
            audioBlob: base64ToBlob(item.audioBase64, item.mimeType),
            error: item.error
        };

        await storage.saveNote(note);
      }

      setStatus('success');
      setStatusMessage(t.status.restoreSuccess);
      onDataChanged();
      setTimeout(() => setStatus('idle'), 3000);

    } catch (error) {
      console.error(error);
      setStatus('error');
      setStatusMessage(t.status.restoreError);
    } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearAll = async () => {
      if (confirm(t.clearConfirm)) {
          try {
              setStatus('loading');
              await storage.clearAllNotes();
              onDataChanged();
              setStatus('success');
              setStatusMessage(t.status.clearSuccess);
              setTimeout(() => setStatus('idle'), 3000);
          } catch (e) {
              setStatus('error');
              setStatusMessage(t.status.clearError);
          }
      }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0f172a] border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative overflow-hidden"
      >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Database size={20} className="text-blue-400" />
                {t.title}
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="space-y-4">
            
            {/* Language Selector */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                    <Globe size={16} />
                    {t.language}
                </h3>
                <div className="flex gap-2">
                    <button 
                        onClick={() => onLanguageChange('en')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                            currentLanguage === 'en' 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                    >
                        English
                    </button>
                    <button 
                        onClick={() => onLanguageChange('th')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                            currentLanguage === 'th' 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                    >
                        ไทย (Thai)
                    </button>
                </div>
            </div>

            {/* Status Banner */}
            {status !== 'idle' && (
                <div className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
                    status === 'loading' ? 'bg-blue-500/10 text-blue-300' :
                    status === 'success' ? 'bg-green-500/10 text-green-300' :
                    'bg-red-500/10 text-red-300'
                }`}>
                    {status === 'loading' && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                    {status === 'success' && <Check size={16} />}
                    {status === 'error' && <AlertCircle size={16} />}
                    {statusMessage}
                </div>
            )}

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                <h3 className="text-sm font-medium text-slate-400 mb-0 flex items-center gap-2">
                    <Database size={16} />
                    {t.dataManagement}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                    {t.backupDesc}
                </p>
                
                <button 
                    onClick={handleExport}
                    disabled={status === 'loading'}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                >
                    <Download size={18} />
                    {t.backupBtn}
                </button>

                <div className="relative">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImportFile}
                        accept=".json"
                        className="hidden"
                    />
                    <button 
                        onClick={handleImportTrigger}
                        disabled={status === 'loading'}
                        className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl font-medium transition-all border border-white/5 disabled:opacity-50"
                    >
                        <Upload size={18} />
                        {t.restoreBtn}
                    </button>
                </div>
            </div>

            <div className="pt-2 border-t border-white/5">
                <button 
                    onClick={handleClearAll}
                    disabled={status === 'loading'}
                    className="w-full flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 py-3 rounded-xl font-medium transition-colors text-sm disabled:opacity-50"
                >
                    <Trash2 size={16} />
                    {t.clearBtn}
                </button>
            </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsModal;