import { useWizardStore } from '@/store/wizardStore';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { PersonaCard } from './PersonaCard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

import { useEffect } from 'react';

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
        setContentMode
    } = useWizardStore();

    useEffect(() => {
        generateInitialPersonas();
    }, []);

    const handleNext = () => {
        if (selectedPersonas.length === 0) {
            toast.error('Pick at least one critic.');
            return;
        }
        setStep('analysis');
    };

    const handleWildcard = async () => {
        try {
            await generateWildcardPersona();
            toast.success('Wildcard Challenger Approaching!');
        } catch (error) {
            toast.error('Failed to summon wildcard.');
        }
    };

    return (
        <div className="h-full flex flex-col space-y-6 animate-fade-in-up pb-8">
            {/* Header / Mode Toggle DO NOT REMOVE */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-xl">
                <div>
                    <h2 className="text-3xl font-serif font-bold tracking-tight">Who's Judging?</h2>
                    <p className="text-muted-foreground text-lg font-light">Select the agents to vibe check your content.</p>
                </div>

                <div className={`
                    flex items-center gap-4 p-4 rounded-xl border transition-colors duration-500
                    ${contentMode === 'crisis' ? 'bg-rose-50 border-rose-200' : 'bg-background/50 border-border/50'}
                `}>
                    <div className="space-y-0.5 text-right">
                        <Label htmlFor="crisis-mode" className={`font-bold block ${contentMode === 'crisis' ? 'text-rose-700' : 'text-foreground'}`}>
                            {contentMode === 'crisis' ? 'CRISIS SIMULATION' : 'Standard Mode'}
                        </Label>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground block">
                            {contentMode === 'crisis' ? 'High Hostility' : 'Normal Sensitivity'}
                        </span>
                    </div>
                    <Switch
                        id="crisis-mode"
                        checked={contentMode === 'crisis'}
                        onCheckedChange={(checked) => setContentMode(checked ? 'crisis' : 'standard')}
                        className="data-[state=checked]:bg-rose-600"
                    />
                    {contentMode === 'crisis' && <AlertTriangle className="text-rose-600 animate-pulse" />}
                </div>
            </div>

            <div className="relative min-h-[500px]"> {/* Added relative container for overlay */}
                {isGeneratingPersonas && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/20 backdrop-blur-[2px] rounded-xl">
                        <div className="bg-background/80 p-6 rounded-2xl shadow-2xl border border-primary/20 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
                            <Loader2 className="size-10 text-primary animate-spin" />
                            <p className="font-mono text-sm uppercase tracking-widest text-primary animate-pulse">Simulating Personas...</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pb-36">
                    <AnimatePresence>
                        {isGeneratingPersonas ? (
                            // Skeleton Loading State
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={`skeleton-${i}`} className="h-[280px] rounded-xl border border-border/50 bg-card/50 p-6 space-y-4 opacity-50">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="size-16 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-32" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <div className="pt-4 flex gap-2">
                                        <Skeleton className="h-6 w-20 rounded-full" />
                                        <Skeleton className="h-6 w-20 rounded-full" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <>
                                {generatedPersonas.map((persona) => (
                                    <motion.div key={persona.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <PersonaCard
                                            persona={persona}
                                            isSelected={selectedPersonas.some(p => p.id === persona.id)}
                                            onToggle={() => togglePersonaSelection(persona)}
                                            isWildcard={persona.id.startsWith('wildcard')}
                                        />
                                    </motion.div>
                                ))}

                                {/* Add Custom / Wildcard Button within Grid */}
                                <motion.button
                                    layout
                                    onClick={handleWildcard}
                                    disabled={isGeneratingWildcard}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="h-full min-h-[250px] rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/5 hover:bg-muted/10 flex flex-col items-center justify-center gap-4 group transition-colors"
                                >
                                    <div className="size-16 rounded-full bg-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        {isGeneratingWildcard ? (
                                            <Sparkles className="size-8 text-primary animate-spin" />
                                        ) : (
                                            <Plus className="size-8 text-muted-foreground group-hover:text-primary" />
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-sans font-bold text-lg">Summon Wildcard</h3>
                                        <p className="text-sm text-muted-foreground">Add a random Persona</p>
                                    </div>
                                </motion.button>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Gradient Bottom Mask & Floating Action Bar */}
            <div className="fixed bottom-0 right-0 left-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-40" />
            <div className="fixed bottom-8 right-8 lg:right-16 z-50">
                <Button
                    onClick={handleNext}
                    disabled={selectedPersonas.length === 0}
                    size="lg"
                    className="rounded-full px-8 h-14 bg-primary text-lg shadow-[0_10px_40px_rgba(var(--primary),0.5)] hover:shadow-[0_10px_50px_rgba(var(--primary),0.7)] hover:-translate-y-1 transition-all"
                >
                    Start Vibe Check <Sparkles className="ml-2 size-5" />
                </Button>
            </div>
        </div>
    );
}
