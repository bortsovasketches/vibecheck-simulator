import { useCallback, useEffect, useState } from 'react';
import { useWizardStore } from '@/store/wizardStore';
import { useUserSettings } from '@/store/userSettings';
import { simulateInterview, synthesizeReport, type InterviewResult } from '@/lib/ai';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { BrainCircuit, Activity, Bot, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function AnalysisView() {
  const {
    content,
    selectedPersonas,
    setInterviewResults,
    setFinalReport,
    isAnalyzing,
    setIsAnalyzing,
    setStep,
    contentMode,
  } = useWizardStore();

  const { getApiKey } = useUserSettings();
  const [completedInterviews, setCompletedInterviews] = useState<string[]>([]);
  const [currentAction, setCurrentAction] = useState<string>('Initializing analysis...');
  const [progress, setProgress] = useState(0);

  const runAnalysis = useCallback(async () => {
    const apiKey = getApiKey();
    if (!apiKey) return;

    setIsAnalyzing(true);
    setCompletedInterviews([]);
    const results: InterviewResult[] = [];

    try {
      for (let i = 0; i < selectedPersonas.length; i++) {
        const persona = selectedPersonas[i];
        setCurrentAction(`Interviewing ${persona.name}...`);

        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
          const result = await simulateInterview(content, persona, apiKey, contentMode);
          results.push(result);
          setCompletedInterviews((prev) => [...prev, persona.id]);
        } catch (error) {
          console.error(`Error interviewing ${persona.name}:`, error);
          toast.error(`Failed to interview ${persona.name}`);
        }

        setProgress(((i + 1) / selectedPersonas.length) * 82);
      }

      setInterviewResults(results);

      if (results.length > 0) {
        setCurrentAction('Synthesizing final report...');
        await new Promise((resolve) => setTimeout(resolve, 700));

        const report = await synthesizeReport(results, apiKey, contentMode);
        setFinalReport(report);
        setProgress(100);

        setTimeout(() => {
          setStep('report');
        }, 600);
      } else {
        toast.error('No interviews completed successfully.');
        setStep('persona-selection');
      }
    } catch (error) {
      console.error(error);
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, contentMode, getApiKey, selectedPersonas, setFinalReport, setInterviewResults, setIsAnalyzing, setStep]);

  useEffect(() => {
    if (!isAnalyzing && selectedPersonas.length > 0 && completedInterviews.length === 0) {
      runAnalysis();
    }
  }, [completedInterviews.length, isAnalyzing, runAnalysis, selectedPersonas.length]);

  return (
    <div className="h-full flex flex-col gap-5 fade-in-up">
      <section className="surface-panel p-5 lg:p-7">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Live Processing</p>
            <h2 className="mt-1 text-3xl lg:text-4xl">
              {contentMode === 'crisis' ? 'Stress Testing Narrative' : 'Running Resonance Analysis'}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We are interviewing selected personas and generating a consolidated report.
            </p>
          </div>
          <div className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary inline-flex items-center gap-2">
            <Activity className="size-4" /> {completedInterviews.length}/{selectedPersonas.length} complete
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-5 flex-1">
        <Card className="xl:col-span-2 p-6 flex items-center justify-center relative overflow-hidden">
          <div className="absolute -top-16 -right-16 size-48 bg-primary/15 rounded-full blur-3xl" />
          <div className="text-center relative z-10">
            <div className="mx-auto size-44 rounded-full border-8 border-primary/15 bg-white grid place-items-center ambient-loader">
              <div className="size-28 rounded-full bg-primary/10 text-primary grid place-items-center">
                <BrainCircuit className="size-11" />
              </div>
            </div>
            <motion.p
              className="mt-5 text-5xl font-bold text-primary"
              key={Math.round(progress)}
              initial={{ opacity: 0.5, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {Math.round(progress)}%
            </motion.p>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">Pipeline Progress</p>
          </div>
        </Card>

        <Card className="xl:col-span-3 p-0 overflow-hidden">
          <CardContent className="p-0 h-full flex flex-col">
            <div className="px-5 py-4 border-b border-border bg-white/70 flex items-center justify-between">
              <p className="text-sm text-foreground flex items-center gap-2"><Loader2 className="size-4 animate-spin text-primary" /> {currentAction}</p>
            </div>
            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedPersonas.map((persona) => {
                const isDone = completedInterviews.includes(persona.id);
                const isCurrent = !isDone && currentAction.includes(persona.name);
                return (
                  <div
                    key={persona.id}
                    className={`rounded-xl border p-3 transition-colors ${
                      isDone
                        ? 'border-emerald-300 bg-emerald-50'
                        : isCurrent
                        ? 'border-primary/50 bg-primary/10'
                        : 'border-border bg-white/75'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="size-9 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                        {persona.avatar ? (
                          <img src={persona.avatar} alt={persona.name} className="size-full object-cover" />
                        ) : (
                          <Bot className="size-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{persona.name}</p>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-[0.15em] truncate">{isDone ? 'Complete' : isCurrent ? 'In progress' : 'Queued'}</p>
                      </div>
                      {isDone && <CheckCircle2 className="size-4 text-emerald-600 ml-auto" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
