import React, { useState, useEffect, useRef } from 'react';
import { Mic, StopCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Waveform from './Waveform';
import { translations } from '../locales';

interface RecordOverlayProps {
  onSave: (blob: Blob, duration: number) => void;
  onCancel: () => void;
  t: typeof translations.en.recordOverlay;
}

const RecordOverlay: React.FC<RecordOverlayProps> = ({ onSave, onCancel, t }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mimeTypeRef = useRef<string>('audio/webm'); // Default fallback

  useEffect(() => {
    startRecording();
    return () => {
      stopMediaTracks();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopMediaTracks = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        // Suspend or close context
        if (audioContextRef.current.state !== 'closed') {
             audioContextRef.current.close();
        }
      }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // 1. Detect supported MIME type
      let selectedMimeType = '';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        selectedMimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        selectedMimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/aac')) {
        selectedMimeType = 'audio/aac';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        selectedMimeType = 'audio/webm';
      }
      
      // If we found a supported type, update ref and options
      if (selectedMimeType) {
        mimeTypeRef.current = selectedMimeType;
      }
      
      const options = selectedMimeType ? { mimeType: selectedMimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Audio Context for Visualization
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyserRef.current = analyser;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        // 2. Create blob with the CORRECT mime type used during recording
        // We prefer the one reported by the recorder, otherwise the one we selected
        const finalType = mediaRecorder.mimeType || mimeTypeRef.current || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: finalType });
        onSave(blob, duration);
        stopMediaTracks();
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert(t.micAccessError);
      onCancel();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-end pb-20 bg-black/60 backdrop-blur-md"
    >
        <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-t-[3rem] p-8 pb-12 shadow-2xl flex flex-col items-center gap-8"
        >
            <div className="w-16 h-1 bg-white/20 rounded-full mb-2" />
            
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">{t.title}</h2>
                <div className="text-4xl font-mono text-blue-400 font-light tracking-wider drop-shadow-sm">
                    {formatTime(duration)}
                </div>
            </div>

            <div className="w-full h-20 flex items-center justify-center bg-black/20 rounded-[2rem] overflow-hidden border border-white/5 shadow-inner">
                <Waveform analyser={analyserRef.current} isRecording={isRecording} />
            </div>

            <div className="flex items-center gap-8">
                 <button 
                    onClick={() => {
                        stopMediaTracks();
                        onCancel();
                    }}
                    className="p-4 rounded-full bg-white/10 text-slate-400 hover:bg-white/20 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <button 
                    onClick={stopRecording}
                    className="p-8 rounded-full bg-red-500 text-white shadow-lg shadow-red-900/50 hover:bg-red-600 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center"
                >
                    <div className="w-8 h-8 bg-white rounded-md" />
                </button>
                
                {/* Spacer for symmetry */}
                <div className="w-14" /> 
            </div>
            
            <p className="text-slate-500 text-sm">{t.tapToFinish}</p>

        </motion.div>
    </motion.div>
  );
};

export default RecordOverlay;