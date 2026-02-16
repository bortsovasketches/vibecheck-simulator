import { useState, useEffect } from 'react';
import { useWizardStore } from '@/store/wizardStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ArrowRight, Download, RefreshCw, Lightbulb, Quote, Activity } from 'lucide-react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';

// Mock Spectrogram Data Generator (since backend doesn't provide per-sentence sentiment yet)
const generateSpectrogramData = (length: number) => {
    return Array.from({ length }, () => Math.random() * 0.8 + 0.2); // values 0.2 - 1.0
};

export function ReportView() {
    const { finalReport, interviewResults, reset, contentMode } = useWizardStore();
    const [activeTab, setActiveTab] = useState(interviewResults?.[0]?.personaName);
    const [spectrogramData] = useState(() => generateSpectrogramData(40)); // 40 data points

    // Spring Animation for Score
    const scoreValue = useMotionValue(0);
    const rawScore = finalReport?.overallScore || 0;
    const targetScore = rawScore <= 1 ? rawScore * 10 : rawScore;

    const springScore = useSpring(scoreValue, { damping: 20, stiffness: 100 });
    const roundedScore = useTransform(springScore, (latest) => latest.toFixed(1));

    useEffect(() => {
        if (finalReport) {
            scoreValue.set(targetScore);
        }
    }, [finalReport, targetScore]);

    if (!finalReport) return null;

    const getScoreColor = (s: number) => {
        if (s >= 8) return 'text-emerald-600 dark:text-emerald-400';
        if (s >= 5) return 'text-amber-600 dark:text-amber-400';
        return 'text-rose-600 dark:text-rose-400';
    };



    return (
        <div className="h-full flex flex-col space-y-8 pb-8 font-sans animate-fade-in-up">
            {/* Header Section */}
            <div className="artisan-card rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground">
                            {contentMode === 'crisis' ? 'Damage Assessment' : 'Vibe Report'}
                        </h2>
                        <Badge variant={contentMode === 'crisis' ? 'destructive' : 'default'} className="animate-pulse">
                            {contentMode === 'crisis' ? 'CRITICAL' : 'READY'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground font-mono text-xs uppercase tracking-wider">
                        <span>{new Date().toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{interviewResults.length} Agents</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={reset} className="font-mono text-xs">
                        <RefreshCw className="mr-2 size-3" /> RE-RUN
                    </Button>
                    <Button className="font-mono text-xs shadow-lg shadow-primary/20">
                        <Download className="mr-2 size-3" /> EXPORT PDF
                    </Button>
                </div>
            </div>

            {/* Removed ScrollArea to allow native scrolling from AppLayout */}
            <div className="flex-1 -mx-6 px-6">
                <div className="space-y-12 pb-20 w-full mx-auto">

                    {/* Dashboard Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* Score & Spectrogram (Left - 7 Cols) */}
                        <div className="lg:col-span-7 space-y-6">
                            <Card className="artisan-card overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Activity className="size-48 text-primary" />
                                </div>
                                <div className="p-8 flex items-center justify-between relative z-10">
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-mono uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                            <Activity className="size-4" /> Resonance Score
                                        </h3>
                                        <div className="flex items-baseline gap-2">
                                            {/* Adjusted tracking and line height to prevent clipping */}
                                            <motion.span className={`text-7xl md:text-8xl font-sans font-black tracking-tighter leading-none ${getScoreColor(targetScore)} drop-shadow-md`}>
                                                {roundedScore}
                                            </motion.span>
                                            <span className="text-2xl text-muted-foreground font-light font-sans">/ 10</span>
                                        </div>
                                    </div>

                                    {/* Go/No-Go Badge */}
                                    {finalReport.goNoGo && (
                                        <div className={`px-6 py-3 rounded-xl border flex flex-col items-center justify-center
                                            ${finalReport.goNoGo.decision === 'GO' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600' :
                                                finalReport.goNoGo.decision === 'NO-GO' ? 'bg-rose-500/10 border-rose-500 text-rose-600' : 'bg-amber-500/10 border-amber-500 text-amber-600'}`}>
                                            <span className="text-2xl font-black uppercase tracking-widest">{finalReport.goNoGo.decision}</span>
                                            <span className="text-xs font-mono font-bold">{finalReport.goNoGo.confidenceScore}% Confidence</span>
                                        </div>
                                    )}
                                </div>

                                {/* Spectrogram Visualization */}
                                <div className="px-8 pb-8 md:px-8">
                                    <h4 className="text-xs font-mono uppercase text-muted-foreground mb-3 flex items-center gap-2">
                                        <Activity className="size-3" /> Sentiment Spectrogram
                                    </h4>
                                    <div className="h-20 flex items-end gap-[2px] w-full justify-between mt-4"> {/* increased h-16 to h-20, fixed gap */}
                                        {spectrogramData.map((val, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${val * 100}%` }}
                                                transition={{ delay: i * 0.02, duration: 0.5 }}
                                                className={`w-full rounded-sm opacity-80 hover:opacity-100 transition-all cursor-pointer hover:scale-y-110 origin-bottom
                                                    ${val > 0.7 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                                                        val > 0.4 ? 'bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]' :
                                                            'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}
                                                `}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </Card>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {finalReport.toneAnalysis && [
                                    { label: 'Defense', value: finalReport.toneAnalysis.defensiveness, color: 'text-rose-500' },
                                    { label: 'Jargon', value: finalReport.toneAnalysis.corporatespeak, color: 'text-blue-500' },
                                    { label: 'Empathy', value: finalReport.toneAnalysis.empathy, color: 'text-purple-500' },
                                    { label: 'Clarity', value: finalReport.toneAnalysis.clarity, color: 'text-emerald-500' },
                                ].map((metric, i) => (
                                    <Card key={i} className="artisan-card p-4 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform">
                                        <span className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest mb-1">{metric.label}</span>
                                        <div className="relative size-12 flex items-center justify-center">
                                            <span className={`text-xl font-mono font-bold ${metric.color}`}>{metric.value}</span>
                                            <svg className="absolute inset-0 size-full -rotate-90">
                                                <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/20" />
                                                <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className={metric.color}
                                                    strokeDasharray={`${(typeof metric.value === 'number' ? metric.value : 0) * 10} 100`} />
                                            </svg>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Executive Summary (Right - 5 Cols) */}
                        <div className="lg:col-span-5 h-full">
                            <Card className="artisan-card h-full flex flex-col relative overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="font-serif italic text-2xl flex items-center gap-2">
                                        <Quote className="size-5 text-primary" />
                                        TL;DR
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-lg leading-relaxed font-medium text-foreground/90 border-l-4 border-primary/50 pl-4 py-1">
                                        {finalReport.executiveSummary}
                                    </p>

                                    {finalReport.goNoGo && (
                                        <div className="mt-8 p-4 rounded-lg bg-secondary/50 border border-border/50 text-sm">
                                            <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                                                <Lightbulb className="size-3" /> Strategic Pivot
                                            </h4>
                                            <p className="text-foreground/80 italic">{finalReport.goNoGo.reasoning}</p>
                                        </div>
                                    )}
                                </CardContent>
                                <div className="absolute -bottom-10 -right-10 size-40 bg-gradient-to-br from-primary/20 to-rose-500/20 blur-3xl rounded-full pointer-events-none" />
                            </Card>
                        </div>
                    </div>

                    {/* Dangerous Phrasing Section Removed as per UX Audit 2024-04-15 */}

                    {/* Deep Dives - Tabbed Interface */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-serif font-bold">Deep Dive Analysis</h3>
                        </div>

                        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="overflow-x-auto pb-2">
                                <TabsList className="bg-transparent gap-2 h-auto p-0">
                                    {interviewResults.map((res) => (
                                        <TabsTrigger
                                            key={res.personaName}
                                            value={res.personaName}
                                            className={`
                                                flex flex-col items-start gap-1 p-3 rounded-xl border border-transparent transition-all
                                                data-[state=active]:bg-primary/10 data-[state=active]:border-primary/50 data-[state=active]:text-foreground
                                                hover:bg-muted/50
                                            `}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="size-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-sm" />
                                                <span className="font-bold text-sm">{res.personaName}</span>
                                            </div>
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>

                            {interviewResults.map((res) => (
                                <TabsContent key={res.personaName} value={res.personaName} className="mt-6 focus-visible:ring-0">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
                                        {/* Main content for this persona */}
                                        <div className="lg:col-span-12 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {/* What Resonated */}
                                                <Card className="artisan-card border-emerald-500/20 bg-emerald-500/5">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-sm font-mono font-bold text-emerald-600 flex items-center gap-2 uppercase tracking-wide">
                                                            <CheckCircle2 className="size-4" /> Vibe Check: Passed
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <ul className="space-y-3">
                                                            {res.strengths.map((s: string, i: number) => (
                                                                <li key={i} className="text-sm text-foreground/80 flex items-start gap-3">
                                                                    <div className="size-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                                                    {s}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </CardContent>
                                                </Card>

                                                {/* Friction Points */}
                                                <Card className="artisan-card border-rose-500/20 bg-rose-500/5">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-sm font-mono font-bold text-rose-600 flex items-center gap-2 uppercase tracking-wide">
                                                            <XCircle className="size-4" /> Vibe Check: Failed
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <ul className="space-y-3">
                                                            {res.confusionPoints.map((s: string, i: number) => (
                                                                <li key={i} className="text-sm text-foreground/80 flex items-start gap-3">
                                                                    <div className="size-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                                                                    {s}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </CardContent>
                                                </Card>

                                                {/* Suggestions */}
                                                <Card className="artisan-card border-primary/20 bg-primary/5">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-sm font-mono font-bold text-primary flex items-center gap-2 uppercase tracking-wide">
                                                            <Lightbulb className="size-4" /> Ideas
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <ul className="space-y-3">
                                                            {res.suggestions.map((s: string, i: number) => (
                                                                <li key={i} className="text-sm text-foreground/80 flex items-start gap-3">
                                                                    <ArrowRight className="size-4 text-primary mt-0.5 shrink-0" />
                                                                    {s}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}
