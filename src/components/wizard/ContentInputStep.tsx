import { useState, useCallback } from 'react';
import { useWizardStore } from '@/store/wizardStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Type, Youtube, Upload, ArrowRight, Sparkles, FileText, Loader2, Link2 } from 'lucide-react';
import { YoutubeTranscript } from 'youtube-transcript';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

const modes = [
  { id: 'text', icon: Type, label: 'Editor' },
  { id: 'youtube', icon: Youtube, label: 'YouTube' },
  { id: 'file', icon: Upload, label: 'File' },
] as const;

export function ContentInputStep() {
  const { content, setContent, setStep } = useWizardStore();
  const [inputText, setInputText] = useState(content || '');
  const [activeMode, setActiveMode] = useState<'text' | 'youtube' | 'file'>('text');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isFetchingYoutube, setIsFetchingYoutube] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type === 'text/plain') {
      const text = await file.text();
      setInputText(text);
      setActiveMode('text');
      toast.success('Text file imported');
      return;
    }

    toast.error('Only .txt files are supported currently');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    accept: { 'text/plain': ['.txt'] },
  });

  const handleNext = () => {
    if (!inputText.trim()) {
      toast.error('Please provide content to analyze.');
      return;
    }

    setContent(inputText, 'text');
    setStep('persona-selection');
  };

  const handleYoutubeFetch = async () => {
    if (!youtubeUrl.trim()) return;
    setIsFetchingYoutube(true);

    try {
      const transcript = await YoutubeTranscript.fetchTranscript(youtubeUrl);
      const text = transcript.map((t) => t.text).join(' ');
      setInputText(text);
      setActiveMode('text');
      toast.success('Transcript extracted');
    } catch (error) {
      console.error(error);
      toast.error('Could not read captions from this video URL.');
    } finally {
      setIsFetchingYoutube(false);
    }
  };

  return (
    <div className="h-full" {...getRootProps()}>
      <input {...getInputProps()} />

      <div className="h-full flex flex-col fade-in-up">
        <section className="surface-panel p-5 lg:p-7">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Input Pipeline</p>
              <h2 className="mt-1 text-3xl lg:text-4xl">Feed Your Content</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Paste text, pull captions from YouTube, or drop a plain text file. We keep this step lightweight so you can move quickly during demos.
              </p>
            </div>
            <Badge variant="secondary" className="self-start lg:self-center">{inputText.length} characters</Badge>
          </div>

          <div className="mt-6 inline-flex rounded-2xl p-1.5 bg-secondary/75 border border-border/80">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const active = activeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setActiveMode(mode.id)}
                  className={cn(
                    'relative rounded-xl px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2',
                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="input-mode"
                      className="absolute inset-0 rounded-xl bg-white border border-border"
                      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                    />
                  )}
                  <Icon className="relative z-10 size-4" />
                  <span className="relative z-10">{mode.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className={cn('relative mt-5 flex-1 surface-panel p-5 lg:p-7 transition-all', isDragActive && 'soft-ring')}>
          <AnimatePresence>
            {isDragActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-4 rounded-2xl border-2 border-dashed border-primary/55 bg-primary/10 z-30 flex items-center justify-center"
              >
                <div className="text-center">
                  <Upload className="mx-auto size-9 text-primary" />
                  <p className="mt-3 text-sm text-primary">Drop text file to import</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {activeMode === 'text' && (
            <div className="h-full flex flex-col">
              <Textarea
                placeholder="Paste the script, launch copy, social post, or transcript..."
                className="h-full min-h-[360px] resize-none text-[15px] leading-7 rounded-2xl bg-white"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                spellCheck={false}
              />
            </div>
          )}

          {activeMode === 'youtube' && (
            <div className="h-full min-h-[320px] grid place-items-center">
              <div className="w-full max-w-xl text-center">
                <div className="mx-auto size-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                  <Link2 className="size-6" />
                </div>
                <h3 className="mt-4 text-2xl">Fetch YouTube Captions</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Paste a YouTube URL with available captions and we’ll extract the transcript into the editor.
                </p>

                <div className="mt-5 flex gap-2">
                  <Input
                    placeholder="https://youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="h-12"
                  />
                  <Button onClick={handleYoutubeFetch} disabled={isFetchingYoutube} className="h-12 px-4">
                    {isFetchingYoutube ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'file' && (
            <div className="h-full min-h-[320px] grid place-items-center">
              <div
                onClick={() => document.getElementById('hidden-file-input')?.click()}
                className="w-full max-w-lg cursor-pointer rounded-2xl border-2 border-dashed border-border bg-white/70 p-10 text-center hover:border-primary/45 transition-colors"
              >
                <div className="mx-auto size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <FileText className="size-5" />
                </div>
                <h3 className="mt-4 text-xl">Import Text File</h3>
                <p className="mt-2 text-sm text-muted-foreground">Drop a `.txt` file here or click to browse.</p>
              </div>
              <input
                type="file"
                id="hidden-file-input"
                className="hidden"
                accept=".txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onDrop([file]);
                }}
              />
            </div>
          )}
        </section>

        <div className="mt-5 flex justify-end">
          <Button onClick={handleNext} disabled={!inputText.trim()} size="lg" className="h-12 px-6">
            <Sparkles className="size-4" /> Continue to Persona Setup
          </Button>
        </div>
      </div>
    </div>
  );
}
