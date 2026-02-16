import { useState, useCallback } from 'react';
import { useWizardStore } from '@/store/wizardStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Type, Upload, Sparkles, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import * as pdfjsLib from 'pdfjs-dist';
// Import worker as a URL so Vite handles it correctly
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set worker source to local file
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const modes = [
  { id: 'text', icon: Type, label: 'Editor' },
  { id: 'file', icon: Upload, label: 'File' },
] as const;

export function ContentInputStep() {
  const { content, setContent, setStep } = useWizardStore();
  const [inputText, setInputText] = useState(content || '');
  const [activeMode, setActiveMode] = useState<'text' | 'file'>('text');
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);

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

    if (file.type === 'application/pdf') {
      try {
        setIsProcessingPdf(true);
        const buffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(buffer).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\\n';
        }

        setInputText(fullText);
        setActiveMode('text');
        toast.success('PDF content extracted');
      } catch (error) {
        console.error('PDF extraction failed:', error);
        toast.error('Failed to extract text from PDF');
      } finally {
        setIsProcessingPdf(false);
      }
      return;
    }

    toast.error('Only .txt and .pdf files are supported');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf']
    },
  });

  const handleNext = () => {
    if (!inputText.trim()) {
      toast.error('Please provide content to analyze.');
      return;
    }

    setContent(inputText, 'text');
    setStep('persona-selection');
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
                Paste text or drop a plain text/PDF file. We keep this step lightweight so you can move quickly during demos.
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



          {activeMode === 'file' && (
            <div className="h-full min-h-[320px] grid place-items-center">
              <div
                onClick={() => document.getElementById('hidden-file-input')?.click()}
                className="w-full max-w-lg cursor-pointer rounded-2xl border-2 border-dashed border-border bg-white/70 p-10 text-center hover:border-primary/45 transition-colors"
                role="button"
                tabIndex={0}
              >
                {isProcessingPdf ? (
                  <>
                    <div className="mx-auto size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center animate-pulse">
                      <Loader2 className="size-6 animate-spin" />
                    </div>
                    <h3 className="mt-4 text-xl">Processing PDF...</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Extracting text, please wait.</p>
                  </>
                ) : (
                  <>
                    <div className="mx-auto size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <FileText className="size-5" />
                    </div>
                    <h3 className="mt-4 text-xl">Import File</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Drop a file or click to browse (.txt, .pdf).</p>
                  </>
                )}
              </div>
              <input
                type="file"
                id="hidden-file-input"
                className="hidden"
                accept=".txt, .pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onDrop([file]);
                    // Reset value so same file can be selected again if needed
                    e.target.value = '';
                  }
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
