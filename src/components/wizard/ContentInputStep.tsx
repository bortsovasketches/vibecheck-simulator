import { useState, useCallback } from 'react';
import { useWizardStore } from '@/store/wizardStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Type, Youtube, Upload, ArrowRight, Sparkles, FileText, Cloud, Quote } from 'lucide-react';
import { YoutubeTranscript } from 'youtube-transcript';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

export function ContentInputStep() {
    const { content, setContent, setStep } = useWizardStore();
    const [inputText, setInputText] = useState(content || '');
    const [activeMode, setActiveMode] = useState<'text' | 'youtube' | 'file'>('text');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [isFetchingYoutube, setIsFetchingYoutube] = useState(false);

    // Sound effect simulation
    const playSound = (type: 'hover' | 'click' | 'success') => {
        // Placeholder
        console.log(`Playing sound: ${type}`);
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (file.type === 'text/plain') {
            const text = await file.text();
            setInputText(text);
            setActiveMode('text');
            playSound('success');
            toast.success('File swallowed successfully');
        } else {
            toast.error('Only .txt files are supported currently');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true,
        accept: { 'text/plain': ['.txt'] }
    });

    const handleNext = () => {
        if (!inputText.trim()) {
            toast.error('Please feed the machine first.');
            return;
        }
        setContent(inputText, 'text');
        playSound('click');
        setStep('persona-selection');
    };

    const handleYoutubeFetch = async () => {
        if (!youtubeUrl.trim()) return;
        setIsFetchingYoutube(true);
        try {
            const transcript = await YoutubeTranscript.fetchTranscript(youtubeUrl);
            const text = transcript.map(t => t.text).join(' ');
            setInputText(text);
            setActiveMode('text');
            playSound('success');
            toast.success('Transcript extracted');
        } catch (error) {
            console.error(error);
            toast.error('Could not swallow video. Check captions.');
        } finally {
            setIsFetchingYoutube(false);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 lg:p-8" {...getRootProps()}>
            <input {...getInputProps()} />

            {/* Header */}
            <div className="w-full max-w-4xl text-center mb-10 space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className="text-6xl md:text-7xl font-serif font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        vibecheck
                    </h1>
                </motion.div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg md:text-xl text-muted-foreground font-light max-w-xl mx-auto"
                >
                    Drop your content into the void. See if it resonates.
                </motion.p>
            </div>

            {/* Main Editor Card */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className={`w-full max-w-5xl content-card relative overflow-hidden transition-all duration-500 rounded-3xl
                ${isDragActive ? 'scale-105 ring-4 ring-primary/50 shadow-[0_0_50px_rgba(var(--primary),0.3)]' : ''}
            `}>
                {/* Drag Overlay */}
                <AnimatePresence>
                    {isDragActive && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 bg-primary/80 backdrop-blur-md flex flex-col items-center justify-center text-white"
                        >
                            <Cloud className="size-32 animate-bounce mb-6 text-white" />
                            <h2 className="text-4xl font-serif font-bold">Feed Me</h2>
                            <p className="font-mono text-white/80 text-lg mt-2">Drop .txt file to consume</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="min-h-[550px] flex flex-col p-6 lg:p-10 gap-6">

                    {/* Horizontal Segmented Control */}
                    <div className="flex items-center justify-center w-full">
                        <div className="inline-flex bg-black/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/5">
                            {[
                                { id: 'text', icon: Type, label: 'Editor' },
                                { id: 'youtube', icon: Youtube, label: 'YouTube' },
                                { id: 'file', icon: Upload, label: 'Upload' }
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => { setActiveMode(mode.id as any); playSound('click'); }}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm
                                    ${activeMode === mode.id
                                            ? 'bg-primary/20 text-primary shadow-sm ring-1 ring-primary/30'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}
                                `}
                                >
                                    <mode.icon className="size-4" />
                                    {mode.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Content Area (Now spans full width) */}
                    <div className="flex-1 flex flex-col relative w-full max-w-4xl mx-auto">

                        {activeMode === 'text' && (
                            <div className="h-full flex flex-col space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Quote className="size-4 opacity-50" />
                                        <span className="text-sm font-sans font-medium uppercase tracking-wider">Raw Input</span>
                                    </div>
                                    <Badge variant="secondary" className="font-mono bg-muted border-border text-muted-foreground">
                                        {inputText.length} chars
                                    </Badge>
                                </div>
                                <Textarea
                                    placeholder="Type or paste your content here..."
                                    className="flex-1 min-h-[300px] bg-background/50 border border-input focus-visible:ring-2 focus-visible:ring-primary text-lg lg:text-xl leading-relaxed resize-none p-4 rounded-xl font-sans placeholder:text-muted-foreground/40 selection:bg-primary/30"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    spellCheck={false}
                                />
                            </div>
                        )}

                        {activeMode === 'youtube' && (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                                <div className="p-8 rounded-full bg-red-500/10 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                                    <Youtube className="size-16 text-red-500" />
                                </div>
                                <div className="w-full max-w-md space-y-4 text-center">
                                    <h3 className="text-2xl font-serif font-bold">Video Vibe Check</h3>
                                    <p className="text-muted-foreground text-sm">Paste a YouTube URL to extract captions automatically.</p>

                                    <div className="flex gap-2 relative group">
                                        <div className="absolute inset-0 bg-red-500/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity rounded-xl" />
                                        <Input
                                            placeholder="https://youtube.com/watch?v=..."
                                            value={youtubeUrl}
                                            onChange={(e) => setYoutubeUrl(e.target.value)}
                                            className="h-12 bg-black/40 border-white/10 font-mono text-sm relative z-10 focus-visible:ring-red-500/50"
                                        />
                                        <Button onClick={handleYoutubeFetch} disabled={isFetchingYoutube} className="h-12 w-12 p-0 rounded-xl relative z-10" variant="destructive">
                                            <ArrowRight className="size-5" />
                                        </Button>
                                    </div>

                                    {isFetchingYoutube && <p className="text-sm text-red-400 animate-pulse font-mono mt-4">Extracting transcript via satellite...</p>}
                                </div>
                            </div>
                        )}

                        {activeMode === 'file' && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                                <div
                                    onClick={() => document.getElementById('hidden-file-input')?.click()}
                                    className="group cursor-pointer p-12 rounded-3xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 w-full max-w-md"
                                >
                                    <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                        <FileText className="size-10 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-sans font-bold mb-2">Drop text file here</h3>
                                    <p className="text-sm text-muted-foreground">or click to browse local files</p>
                                </div>
                                <input
                                    type="file"
                                    id="hidden-file-input"
                                    className="hidden"
                                    accept=".txt"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            onDrop([file]);
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {/* Bottom Actions */}
                        <div className="mt-auto pt-8 border-t border-white/5 flex justify-between items-center">
                            <Button variant="ghost" onClick={() => setStep('api-key')} className="text-muted-foreground hover:text-foreground transition-colors">
                                Configure API
                            </Button>
                            <Button
                                onClick={handleNext}
                                disabled={!inputText}
                                size="lg"
                                className="rounded-full px-8 py-6 text-md font-bold bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:shadow-[0_0_30px_rgba(var(--primary),0.6)] hover:scale-105 transition-all duration-300"
                            >
                                <Sparkles className="mr-2 size-5 animate-pulse" />
                                Analyze Vibes
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
