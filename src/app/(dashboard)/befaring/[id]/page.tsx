'use client';

import { use, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mic, Send, FileText, Loader2, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { id: 'generelt', name: 'Generelt' },
  { id: 'tak', name: 'Tak' },
  { id: 'fasade', name: 'Fasade' },
  { id: 'vinduer', name: 'Vinduer/dører' },
  { id: 'bad', name: 'Våtrom' },
  { id: 'kjokken', name: 'Kjøkken' },
  { id: 'elektrisk', name: 'Elektrisk' },
  { id: 'vvs', name: 'VVS' },
  { id: 'annet', name: 'Annet' },
];

interface Note {
  id: string;
  sectionId: string;
  noteType: string;
  content: string;
  createdAt: string;
}

interface Inspection {
  id: string;
  address: string;
  status: string | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BefaringDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeSection, setActiveSection] = useState('generelt');
  const [textNote, setTextNote] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSavingText, setIsSavingText] = useState(false);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notesEndRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/inspections/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    setInspection(data.inspection);
    setNotes(data.notes);
  }, [id]);

  useEffect(() => {
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  useEffect(() => {
    notesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notes, activeSection]);

  const startRecording = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Talegjenkjenning støttes ikke i denne nettleseren');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'nb-NO';
    recognition.continuous = true;
    recognition.interimResults = false;

    transcriptRef.current = '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let text = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          text += event.results[i][0].transcript + ' ';
        }
      }
      transcriptRef.current = text.trim();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Mikrofontilgang ble avslått');
      }
    };

    recognition.onend = () => {
      // Save transcript when recognition ends (after stopRecording)
      if (transcriptRef.current) {
        saveVoiceNote(transcriptRef.current);
      } else {
        toast.error('Ingen tale ble fanget opp');
        setIsTranscribing(false);
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch {
      toast.error('Kunne ikke starte talegjenkjenning');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
    setIsTranscribing(true);
    recognitionRef.current?.stop();
  };

  const saveVoiceNote = async (transcription: string) => {
    try {
      await fetch(`/api/inspections/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: activeSection,
          noteType: 'voice',
          content: transcription,
        }),
      });
      await fetchData();
    } catch {
      toast.error('Kunne ikke lagre notatet');
    } finally {
      setIsTranscribing(false);
    }
  };

  const saveTextNote = async () => {
    if (!textNote.trim()) return;
    setIsSavingText(true);
    try {
      await fetch(`/api/inspections/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: activeSection,
          noteType: 'text',
          content: textNote.trim(),
        }),
      });
      setTextNote('');
      await fetchData();
    } finally {
      setIsSavingText(false);
    }
  };

  const createReport = async () => {
    setIsCreatingReport(true);
    try {
      const res = await fetch(`/api/inspections/${id}/create-report`, { method: 'POST' });
      const { reportId } = await res.json();
      toast.success('Rapport opprettet fra befaring');
      router.push(`/reports/${reportId}/edit`);
    } catch {
      toast.error('Kunne ikke opprette rapport');
      setIsCreatingReport(false);
    }
  };

  const sectionNotes = notes.filter((n) => n.sectionId === activeSection);

  const formatSeconds = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!inspection) return null;

  const totalNotes = notes.length;
  const sectionsWithNotes = new Set(notes.map((n) => n.sectionId)).size;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[calc(100vh-4rem)] -m-6 lg:-m-8">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/befaring">
            <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <p className="font-semibold text-sm leading-tight">{inspection.address}</p>
            <p className="text-xs text-muted-foreground">
              {totalNotes} notat{totalNotes !== 1 ? 'er' : ''} · {sectionsWithNotes} seksjon{sectionsWithNotes !== 1 ? 'er' : ''}
            </p>
          </div>
        </div>
        {inspection.status !== 'completed' && totalNotes > 0 && (
          <Button
            size="sm"
            className="rounded-xl gap-1.5 text-xs"
            onClick={createReport}
            disabled={isCreatingReport}
          >
            {isCreatingReport ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
            Opprett rapport
          </Button>
        )}
        {inspection.status === 'completed' && (
          <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Fullført
          </span>
        )}
      </div>

      {/* Section tabs - horizontal scroll */}
      <div className="flex overflow-x-auto gap-2 px-4 py-3 border-b bg-background flex-shrink-0 scrollbar-none">
        {SECTIONS.map((section) => {
          const count = notes.filter((n) => n.sectionId === section.id).length;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors flex-shrink-0 font-medium',
                activeSection === section.id
                  ? 'bg-primary text-primary-foreground'
                  : count > 0
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
              )}
            >
              {section.name}
              {count > 0 && (
                <span className={cn(
                  'text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold',
                  activeSection === section.id ? 'bg-white/20' : 'bg-primary/20'
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {sectionNotes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Mic className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Ingen notater for {SECTIONS.find(s => s.id === activeSection)?.name} ennå</p>
            <p className="text-xs mt-1 opacity-60">Ta opp tale eller skriv et notat</p>
          </div>
        ) : (
          sectionNotes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'rounded-xl p-3.5 text-sm',
                note.noteType === 'voice'
                  ? 'bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900'
                  : 'bg-card border'
              )}
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                {note.noteType === 'voice' ? (
                  <Mic className="w-3 h-3 text-blue-500" />
                ) : (
                  <FileText className="w-3 h-3" />
                )}
                <span className="font-medium">
                  {note.noteType === 'voice' ? 'Talenotat' : 'Tekstnotat'}
                </span>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />
                  {formatTime(note.createdAt)}
                </span>
              </div>
              <p className="leading-relaxed">{note.content}</p>
            </motion.div>
          ))
        )}
        <div ref={notesEndRef} />
      </div>

      {/* Input area - sticky bottom */}
      <div className="border-t bg-background px-4 py-3 space-y-2.5 flex-shrink-0">
        {/* Text input */}
        <div className="flex gap-2">
          <Textarea
            value={textNote}
            onChange={(e) => setTextNote(e.target.value)}
            placeholder={`Notat for ${SECTIONS.find(s => s.id === activeSection)?.name}...`}
            className="rounded-xl resize-none text-sm min-h-0 h-10 py-2.5"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                saveTextNote();
              }
            }}
          />
          <Button
            size="icon"
            className="rounded-xl h-10 w-10 flex-shrink-0"
            onClick={saveTextNote}
            disabled={!textNote.trim() || isSavingText}
          >
            {isSavingText ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>

        {/* Voice button */}
        <AnimatePresence mode="wait">
          {isTranscribing ? (
            <motion.div
              key="transcribing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full py-3 rounded-xl bg-muted flex items-center justify-center gap-2 text-muted-foreground text-sm"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Transkriberer opptak...
            </motion.div>
          ) : isRecording ? (
            <motion.button
              key="recording"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={stopRecording}
              className="w-full py-3 rounded-xl bg-red-500 text-white font-medium flex items-center justify-center gap-2 text-sm"
            >
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-2.5 h-2.5 bg-white rounded-full"
              />
              Stopp – {formatSeconds(recordingSeconds)}
            </motion.button>
          ) : (
            <motion.button
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={startRecording}
              className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium flex items-center justify-center gap-2 text-sm transition-colors"
            >
              <Mic className="w-4 h-4" />
              Hold for å ta opp tale
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
