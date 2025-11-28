
import React, { useState, useEffect } from 'react';
import { Mic, Search, Settings } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { NoteData } from './types';
import * as storage from './services/storage';
import * as gemini from './services/geminiService';
import { translations, Language } from './locales';

import NoteList from './components/NoteList';
import RecordOverlay from './components/RecordOverlay';
import NoteDetail from './components/NoteDetail';
import SettingsModal from './components/SettingsModal';
import CatLogo from './components/CatLogo';

const App: React.FC = () => {
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [selectedNote, setSelectedNote] = useState<NoteData | null>(null);
  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState<Language>('en');

  // Load notes and language pref on mount
  const loadNotes = async () => {
    try {
      const loadedNotes = await storage.getNotes();
      setNotes(loadedNotes);
    } catch (error) {
      console.error("Failed to load notes", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
    const savedLang = localStorage.getItem('ideavoice_lang') as Language;
    if (savedLang === 'en' || savedLang === 'th') {
      setLanguage(savedLang);
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('ideavoice_lang', lang);
  };

  const t = translations[language];

  const handleSaveRecording = async (blob: Blob, duration: number) => {
    setIsRecordingMode(false);
    
    // Create optimistic note
    const newNote: NoteData = {
      id: uuidv4(),
      createdAt: Date.now(),
      audioBlob: blob,
      duration: duration,
      title: language === 'th' ? "กำลังประมวลผล..." : "Processing...",
      transcription: language === 'th' ? "โปรดรอสักครู่..." : "Wait a moment while we process your thought...",
      summary: "",
      keyPoints: [],
      tags: [],
      actionItems: [],
      isProcessing: true,
    };

    // Update UI immediately
    setNotes(prev => [newNote, ...prev]);
    
    try {
        // Save initial state
        await storage.saveNote(newNote);

        // Process with Gemini, passing the current language preference
        const result = await gemini.processAudioNote(blob, language);
        
        // Update note with results
        const updatedNote: NoteData = {
            ...newNote,
            ...result,
            isProcessing: false
        };

        // Save updated note
        await storage.saveNote(updatedNote);
        
        // Update state
        setNotes(prev => prev.map(n => n.id === newNote.id ? updatedNote : n));

    } catch (error) {
        console.error("Processing failed", error);
        const errorNote: NoteData = {
            ...newNote,
            title: language === 'th' ? "การประมวลผลล้มเหลว" : "Processing Failed",
            transcription: language === 'th' ? "ขออภัย เราไม่สามารถประมวลผลเสียงนี้ได้" : "Sorry, we couldn't process this audio. Please try again.",
            isProcessing: false,
            error: "Failed to process"
        };
        setNotes(prev => prev.map(n => n.id === newNote.id ? errorNote : n));
        await storage.saveNote(errorNote);
    }
  };

  const handleDeleteNote = async (id: string) => {
      setNotes(prev => prev.filter(n => n.id !== id));
      // Re-sync with DB to ensure consistency just in case
      await loadNotes();
  };

  return (
    <div className="min-h-screen max-w-md mx-auto relative text-white shadow-2xl overflow-hidden sm:border-x sm:border-white/10 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#020617]">
      
      {/* Header */}
      <header className="pt-6 pb-4 px-6 sticky top-0 z-10 backdrop-blur-md bg-transparent">
        <div className="flex flex-row items-center justify-between mb-6 gap-2">
            
            {/* Left Aligned Branding Row */}
            <div className="flex flex-row items-center gap-3 sm:gap-4 flex-1 overflow-hidden">
                <div className="flex-shrink-0">
                    <CatLogo className="w-20 h-20 sm:w-24 sm:h-24" /> 
                </div>
                <div className="flex flex-col text-left justify-center min-w-0">
                    <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white drop-shadow-md leading-none truncate pb-1">IdeaVoice</h1>
                    <p className="text-sm sm:text-base font-medium mt-0 tracking-wide text-slate-400 truncate">{t.app.slogan}</p>
                </div>
            </div>

            {/* Settings Button - Flex Item (No Absolute) */}
            <div className="flex-shrink-0 self-start mt-2">
                <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white border border-white/10 shadow-lg hover:bg-white/20 transition-colors"
                    aria-label={t.app.settings}
                >
                    <Settings size={20} className="text-blue-200" />
                </button>
            </div>
        </div>

        {/* Search */}
        <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input 
                type="text" 
                placeholder={t.app.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/5 py-3 pl-12 pr-4 rounded-2xl shadow-inner text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:bg-white/15 focus:outline-none transition-all"
            />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4">
        {isLoading ? (
            <div className="flex justify-center pt-20">
                <div className="w-8 h-8 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        ) : (
            <NoteList 
                notes={notes} 
                onSelect={setSelectedNote} 
                searchQuery={searchQuery}
                t={t.noteList}
            />
        )}
      </main>

      {/* Floating Record Button */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsRecordingMode(true)}
            className="flex items-center gap-3 bg-[#007AFF] text-white pl-6 pr-8 py-4 rounded-full shadow-lg shadow-blue-900/40 hover:shadow-blue-600/30 border border-white/10 transition-all backdrop-blur-md"
        >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                <Mic size={16} className="text-white" />
            </div>
            <span className="font-semibold tracking-wide">{t.app.recordButton}</span>
        </motion.button>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {isRecordingMode && (
            <RecordOverlay 
                onSave={handleSaveRecording}
                onCancel={() => setIsRecordingMode(false)}
                t={t.recordOverlay}
            />
        )}
        
        {selectedNote && (
            <NoteDetail 
                note={selectedNote} 
                onClose={() => setSelectedNote(null)}
                onDelete={handleDeleteNote}
                t={t.noteDetail}
            />
        )}

        {isSettingsOpen && (
            <SettingsModal 
                onClose={() => setIsSettingsOpen(false)}
                onDataChanged={loadNotes}
                currentLanguage={language}
                onLanguageChange={handleLanguageChange}
                t={t.settingsModal}
            />
        )}
      </AnimatePresence>
      
    </div>
  );
};

export default App;
