import React from 'react';
import { NoteData } from '../types';
import { Clock, Calendar, ChevronRight, Tag, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { translations } from '../locales';

interface NoteListProps {
  notes: NoteData[];
  onSelect: (note: NoteData) => void;
  searchQuery: string;
  t: typeof translations.en.noteList;
}

const NoteList: React.FC<NoteListProps> = ({ notes, onSelect, searchQuery, t }) => {
  const filteredNotes = notes.filter(note => {
    const q = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(q) ||
      note.transcription.toLowerCase().includes(q) ||
      note.tags.some(t => t.toLowerCase().includes(q))
    );
  });

  if (filteredNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <p className="text-lg font-medium">{t.emptyTitle}</p>
        <p className="text-sm opacity-70">{t.emptySubtitle}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 pb-24">
      {filteredNotes.map((note) => (
        <motion.div
          key={note.id}
          layoutId={`card-${note.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(note)}
          className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-6 cursor-pointer border border-white/5 shadow-lg transition-all group relative overflow-hidden"
        >
          {note.isProcessing && (
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
               <div className="h-full bg-blue-500 animate-progress-indeterminate"></div>
            </div>
          )}

          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className={`text-xl font-bold text-white mb-1 ${note.isProcessing ? 'animate-pulse' : ''}`}>
                {note.isProcessing ? t.processingTitle : note.title}
              </h3>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <Calendar size={14} />
                {new Date(note.createdAt).toLocaleDateString(t.dateFormat, { month: 'short', day: 'numeric' })}
                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                <Clock size={14} />
                {new Date(note.createdAt).toLocaleTimeString(t.dateFormat, { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {!note.isProcessing && (
               <div className="bg-white/10 p-2 rounded-full text-slate-400 group-hover:bg-white/20 group-hover:text-white transition-colors">
                  <ChevronRight size={20} />
               </div>
            )}
            {note.isProcessing && (
               <div className="bg-blue-500/20 p-2 rounded-full text-blue-400 animate-spin">
                  <Loader2 size={20} />
               </div>
            )}
          </div>

          <p className="text-slate-300 line-clamp-2 leading-relaxed mb-4 text-sm font-light">
            {note.isProcessing ? t.processingSubtitle : note.summary || note.transcription}
          </p>

          <div className="flex flex-wrap gap-2">
            {note.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-white/10 text-slate-300 text-xs font-medium rounded-full flex items-center gap-1 border border-white/5">
                <Tag size={10} />
                {tag}
              </span>
            ))}
            {note.duration > 0 && (
                <span className="px-3 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-medium rounded-full">
                    {Math.floor(note.duration)}{t.audioDuration}
                </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default NoteList;