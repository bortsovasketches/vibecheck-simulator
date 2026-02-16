import { useEffect } from 'react';
import { useWizardStore } from '@/store/wizardStore';
import { Button } from '@/components/ui/button';
import { Plus, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { PersonaCard } from './PersonaCard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function PersonaSelectionStep() {
  const {
    generatedPersonas,
    selectedPersonas,
    togglePersonaSelection,
    setStep,
    generateWildcardPersona,
    generateInitialPersonas,
    isGeneratingPersonas,
    isGeneratingWildcard,
    contentMode,
    setContentMode,
  } = useWizardStore();

  useEffect(() => {
    generateInitialPersonas();
  }, [generateInitialPersonas]);

  const handleNext = () => {
    if (selectedPersonas.length === 0) {
      toast.error('Pick at least one persona.');
      return;
    }
    setStep('analysis');
  };

  const handleWildcard = async () => {
    try {
      await generateWildcardPersona();
      toast.success('Wildcard persona generated');
    } catch {
      toast.error('Failed to generate wildcard persona.');
    }
  };

  return (
    <div className="h-full flex flex-col gap-5 fade-in-up">
      <section className="surface-panel p-5 lg:p-7">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Persona Deck</p>
            <h2 className="mt-1 text-3xl">Choose Your Reviewers</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Select the voices that should evaluate your content. Combine customer lenses, skeptics, and a wildcard to stress-test your message.
            </p>
          </div>

          <div
            className={cn(
              'rounded-2xl border px-4 py-3 flex items-center gap-3',
              contentMode === 'crisis'
                ? 'border-rose-300 bg-rose-50'
                : 'border-border bg-white/70'
            )}
          >
            <div className="text-right">
              <Label htmlFor="crisis-mode" className="text-sm font-semibold">
                {contentMode === 'crisis' ? 'Crisis Simulation' : 'Standard Mode'}
              </Label>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {contentMode === 'crisis' ? 'High-hostility prompts' : 'Balanced prompts'}
              </p>
            </div>
            <Switch
              id="crisis-mode"
              checked={contentMode === 'crisis'}
              onCheckedChange={(checked) => setContentMode(checked ? 'crisis' : 'standard')}
              className="data-[state=checked]:bg-rose-600"
            />
            {contentMode === 'crisis' && <AlertTriangle className="size-4 text-rose-600" />}
          </div>
        </div>
      </section>

      <section className="relative flex-1 surface-panel p-5 lg:p-7 min-h-[420px]">
        {isGeneratingPersonas ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/70 bg-white/65 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-12 rounded-full" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-5/6" />
                <Skeleton className="h-3.5 w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
              {generatedPersonas.map((persona) => (
                <PersonaCard
                  key={persona.id}
                  persona={persona}
                  isSelected={selectedPersonas.some((p) => p.id === persona.id)}
                  onToggle={() => togglePersonaSelection(persona)}
                  isWildcard={persona.id.startsWith('wildcard')}
                />
              ))}

              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.995 }}
                onClick={handleWildcard}
                disabled={isGeneratingWildcard}
                className="surface-panel h-full min-h-[240px] rounded-2xl border border-dashed border-primary/35 hover:border-primary/55 transition-colors flex flex-col items-center justify-center gap-3"
              >
                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  {isGeneratingWildcard ? <Loader2 className="size-6 animate-spin" /> : <Plus className="size-6" />}
                </div>
                <h3 className="text-xl">Summon Wildcard</h3>
                <p className="text-sm text-muted-foreground">Generate one additional random persona.</p>
              </motion.button>
            </div>

            <div className="sticky bottom-0 pt-5 bg-gradient-to-t from-background via-background/92 to-transparent">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {selectedPersonas.length} selected
                  {selectedPersonas.length > 0 ? ': ready for analysis.' : ', select at least one persona.'}
                </p>
                <Button onClick={handleNext} disabled={selectedPersonas.length === 0} size="lg" className="h-12 px-6">
                  Start Analysis <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {isGeneratingPersonas && (
          <div className="absolute inset-0 bg-background/45 backdrop-blur-[2px] grid place-items-center rounded-2xl">
            <div className="surface-panel px-5 py-4 flex items-center gap-3">
              <Loader2 className="size-5 animate-spin text-primary" />
              <p className="text-sm">Generating personas...</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
