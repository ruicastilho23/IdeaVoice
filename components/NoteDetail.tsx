
import React, { useRef, useState, useEffect } from 'react';
import { NoteData } from '../types';
import { X, Play, Pause, Trash2, Tag, CheckCircle2, List, FileText, Share2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { deleteNote } from '../services/storage';
import { translations } from '../locales';

interface NoteDetailProps {
  note: NoteData;
  onClose: () => void;
  onDelete: (id: string) => void;
  t: typeof translations.en.noteDetail;
}

const NoteDetail: React.FC<NoteDetailProps> = ({ note, onClose, onDelete, t }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (note.audioBlob) {
      const url = URL.createObjectURL(note.audioBlob);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [note.audioBlob]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play()
            .catch(e => console.error("Playback failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t.deleteConfirm)) {
      try {
        setIsDeleting(true);
        await deleteNote(note.id);
        onDelete(note.id);
        onClose();
      } catch (error) {
        console.error("Failed to delete note:", error);
        alert("Could not delete note. Please try again.");
        setIsDeleting(false);
      }
    }
  };

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `
Title: ${note.title}
Date: ${new Date(note.createdAt).toLocaleDateString(t.dateFormat)}

${t.summary}:
${note.summary}

${t.keyPoints}:
${note.keyPoints.map(p => `- ${p}`).join('\n')}

${t.actionItems}:
${note.actionItems.map(i => `[ ] ${i}`).join('\n')}

${t.transcript}:
${note.transcription}
    `.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/\s+/g, '_')}.txt`;
    a.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-[#020617] flex flex-col text-white"
    >
      <div className="sticky top-0 z-10 bg-[#020617]/80 backdrop-blur-md p-4 flex justify-between items-center border-b border-white/5">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
        <div className="flex gap-2">
            <button onClick={handleExport} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title={t.exportTooltip}>
                <Share2 size={20} />
            </button>
            <button 
                onClick={handleDelete} 
                disabled={isDeleting}
                className="p-2 rounded-full hover:bg-red-500/10 text-red-400 transition-colors disabled:opacity-50" 
                title={t.deleteTooltip}
            >
                {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24 max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
           <h1 className="text-3xl font-bold text-white mb-2 leading-tight drop-shadow-sm">{note.title}</h1>
           <p className="text-slate-400 text-sm">
             {t.capturedOn} {new Date(note.createdAt).toLocaleDateString(t.dateFormat)} {t.at} {new Date(note.createdAt).toLocaleTimeString(t.dateFormat)}
           </p>
        </div>

        {/* Audio Player Card */}
        <div className="bg-white/5 rounded-2xl p-4 mb-8 flex items-center gap-4 border border-white/5 shadow-inner">
            <button 
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform shadow-lg shadow-blue-900/40"
            >
                {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
            </button>
            <div className="flex-1">
                 <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-100 relative" style={{ width: `${progress}%` }}>
                       <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-sm" />
                    </div>
                 </div>
                 <div className="flex justify-between mt-2 text-xs text-slate-400 font-mono">
                    <span>{isPlaying && audioRef.current ? Math.floor(audioRef.current.currentTime) : '0'}s</span>
                    <span>{Math.floor(note.duration)}s</span>
                 </div>
            </div>
            {audioUrl && (
                <audio 
                    ref={audioRef} 
                    src={audioUrl} 
                    onTimeUpdate={handleTimeUpdate} 
                    onEnded={handleAudioEnded}
                    playsInline
                    onError={(e) => console.error("Audio error", e)}
                />
            )}
        </div>

        {/* Summary */}
        <div className="mb-8">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{t.summary}</h2>
            <p className="text-lg text-white leading-relaxed font-light bg-blue-900/20 p-5 rounded-xl border border-blue-500/20">
                {note.summary}
            </p>
        </div>

        {/* Key Points & Actions Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <List size={14} /> {t.keyPoints}
                </h2>
                <ul className="space-y-3">
                    {note.keyPoints.map((point, i) => (
                        <li key={i} className="flex gap-3 text-slate-300 items-start text-sm font-light">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                            <span className="leading-relaxed">{point}</span>
                        </li>
                    ))}
                    {note.keyPoints.length === 0 && <li className="text-slate-500 italic text-sm">{t.noKeyPoints}</li>}
                </ul>
            </div>

            <div>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <CheckCircle2 size={14} /> {t.actionItems}
                </h2>
                 <ul className="space-y-3">
                    {note.actionItems.map((item, i) => (
                        <li key={i} className="flex gap-3 text-slate-300 items-start text-sm font-light">
                             <div className="w-4 h-4 rounded border border-slate-600 flex-shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{item}</span>
                        </li>
                    ))}
                    {note.actionItems.length === 0 && <li className="text-slate-500 italic text-sm">{t.noActionItems}</li>}
                </ul>
            </div>
        </div>

        {/* Transcript */}
        <div className="mb-8">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <FileText size={14} /> {t.transcript}
            </h2>
            <div className="bg-white/5 rounded-xl p-6 text-slate-300 leading-loose text-justify text-sm font-light border border-white/5">
                {note.transcription}
            </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
            {note.tags.map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-white/10 text-slate-400 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-white/5">
                    <Tag size={12} />
                    {tag}
                </span>
            ))}
        </div>

      </div>
    </motion.div>
  );
};

export default NoteDetail;