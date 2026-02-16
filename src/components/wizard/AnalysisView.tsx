import { useEffect, useState } from 'react';
import { useWizardStore } from '@/store/wizardStore';
import { useUserSettings } from '@/store/userSettings';
import { simulateInterview, synthesizeReport, type InterviewResult } from '@/lib/ai';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { BrainCircuit, Activity, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AnalysisView() {
    const {
        content,
        selectedPersonas,
        setInterviewResults,
        setFinalReport,
        isAnalyzing,
        setIsAnalyzing,
        setStep,
        contentMode
    } = useWizardStore();

    const { getApiKey } = useUserSettings();
    const [completedInterviews, setCompletedInterviews] = useState<string[]>([]);
    const [currentAction, setCurrentAction] = useState<string>('Initializing Vibe Check...');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isAnalyzing && selectedPersonas.length > 0 && completedInterviews.length === 0) {
            runAnalysis();
        }
    }, []);

    const playSound = (type: 'pulse' | 'complete') => {
        // Placeholder for sound FX
        console.log('Playing sound:', type);
    };

    const runAnalysis = async () => {
        const apiKey = getApiKey();
        if (!apiKey) return;

        setIsAnalyzing(true);
        setCompletedInterviews([]);
        const results: InterviewResult[] = [];

        try {
            // 1. Run interviews
            for (let i = 0; i < selectedPersonas.length; i++) {
                const persona = selectedPersonas[i];
                setCurrentAction(`Vibe Checking: ${persona.name}...`);
                playSound('pulse');

                // Artificial delay for "Kinetic" feel
                await new Promise(resolve => setTimeout(resolve, 800));

                try {
                    const result = await simulateInterview(content, persona, apiKey, contentMode);
                    results.push(result);
                    setCompletedInterviews(prev => [...prev, persona.id]);
                    playSound('complete');
                } catch (error) {
                    console.error(`Error interviewing ${persona.name}:`, error);
                    toast.error(`Failed to interview ${persona.name}`);
                }

                setProgress(((i + 1) / selectedPersonas.length) * 80);
            }

            setInterviewResults(results);

            // 2. Synthesize report
            if (results.length > 0) {
                setCurrentAction('Synthesizing Spectrogram...');
                await new Promise(resolve => setTimeout(resolve, 1500));

                const report = await synthesizeReport(results, apiKey, contentMode);
                setFinalReport(report);
                setProgress(100);
                playSound('complete');

                setTimeout(() => {
                    setStep('report');
                }, 800);
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
    };

    return (
        <div className="h-full flex flex-col items-center justify-center w-full space-y-12 animate-fade-in-up">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-mono tracking-wider border border-primary/20 animate-pulse">
                    <Activity className="size-4" />
                    LIVE ANALYSIS
                </div>
                <h2 className="text-4xl font-serif font-bold tracking-tight">
                    {contentMode === 'crisis' ? 'Simulating Backlash...' : 'Reading Room Temperature...'}
                </h2>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto font-light">
                    Agents are consuming your content. Watch their real-time reactions below.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 w-full items-center">
                {/* Visualizer: The Neural Orb */}
                <div className="relative flex items-center justify-center">
                    <div className="relative size-72">
                        {/* Spinning Rings */}
                        <div className="absolute inset-0 rounded-full border-[1px] border-primary/20 animate-[spin_10s_linear_infinite]" />
                        <div className="absolute inset-8 rounded-full border-[1px] border-dashed border-indigo-500/30 animate-[spin_15s_linear_infinite_reverse]" />
                        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin shadow-[0_0_15px_rgba(var(--primary),0.5)]" />

                        {/* Center Pulse */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="glass-panel size-40 rounded-full flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-2xl">
                                <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                                <BrainCircuit className="size-10 text-primary mb-2 relative z-10 animate-bounce-slow" />
                                <span className="text-3xl font-bold font-mono relative z-10 tabular-nums">
                                    {Math.round(progress)}%
                                </span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Processing</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Heatmap Grid */}
                <Card className="artisan-card border-0 bg-background/40">
                    <CardContent className="space-y-6 pt-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div className="flex items-center gap-3 text-lg font-medium font-mono text-primary">
                                <Radio className="size-5 animate-pulse" />
                                <span className="uppercase tracking-wider text-sm">{currentAction}</span>
                            </div>
                            <span className="font-mono text-xs text-muted-foreground">
                                {completedInterviews.length}/{selectedPersonas.length} AGENTS
                            </span>
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                            <AnimatePresence>
                                {selectedPersonas.map((persona) => {
                                    const isCompleted = completedInterviews.includes(persona.id);
                                    const isCurrent = !isCompleted && currentAction.includes(persona.name);

                                    // Simulated "Sentiment" color (random for visual effect during loading, strictly speaking we'd use real data if we streamed it)
                                    // For now, completed = green/neutral, current = pulsing purple

                                    return (
                                        <motion.div
                                            key={persona.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="relative group"
                                        >
                                            <div className={`
                                                aspect-square rounded-xl flex items-center justify-center border-2 transition-all duration-500 relative overflow-hidden
                                                ${isCurrent ? 'border-primary shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-110 z-10 bg-background' : ''}
                                                ${isCompleted ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-border/50 bg-background/50'}
                                            `}>
                                                {isCurrent && (
                                                    <div className="absolute inset-0 bg-primary/20 animate-pulse" />
                                                )}

                                                <span className="text-xl select-none">
                                                    {isCompleted ? '✅' : '👤'}
                                                </span>

                                                {/* Tooltip-ish name */}
                                                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-mono text-center py-0.5 truncate px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {persona.name.split(' ')[0]}
                                                </div>
                                            </div>

                                            {/* Status Dot */}
                                            <div className={`absolute -top-1 -right-1 size-3 rounded-full border-2 border-background
                                                ${isCompleted ? 'bg-emerald-500' : isCurrent ? 'bg-primary' : 'bg-muted'}
                                            `} />
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
