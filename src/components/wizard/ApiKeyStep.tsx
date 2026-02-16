import { useState } from 'react';
import { useUserSettings } from '@/store/userSettings';
import { useWizardStore } from '@/store/wizardStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowRight, Lock, Sparkles } from 'lucide-react';

export function ApiKeyStep() {
    const { googleApiKey, setGoogleApiKey } = useUserSettings();
    const { setStep } = useWizardStore();
    const [localGoogleKey, setLocalGoogleKey] = useState(googleApiKey || '');

    const handleSave = () => {
        if (!localGoogleKey.trim()) {
            toast.error('Please enter a Google API Key');
            return;
        }

        setGoogleApiKey(localGoogleKey);
        toast.success('API Key saved successfully');
        setStep('content-input');
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 size-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 size-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <Card className="w-full max-w-md border-border/50 shadow-2xl bg-card/60 backdrop-blur-xl relative z-10 animate-fade-in-up">
                <CardHeader className="text-center space-y-4 pb-2">
                    <div className="mx-auto size-16 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/25">
                        <Lock className="size-8 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-serif font-bold">Connect Gemini AI</CardTitle>
                        <CardDescription className="text-base mt-2">
                            Enter your Google Gemini API key to enable the persona engine. Your key is stored locally on your device.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="google-key" className="text-sm font-medium">Gemini API Key</Label>
                            <div className="relative group">
                                <Input
                                    id="google-key"
                                    type="password"
                                    placeholder="AIzaSy..."
                                    value={localGoogleKey}
                                    onChange={(e) => setLocalGoogleKey(e.target.value)}
                                    className="pr-10 h-12 text-lg font-mono tracking-wider bg-background/50 focus:bg-background transition-all"
                                />
                                <div className="absolute inset-0 rounded-lg ring-1 ring-primary/20 pointer-events-none group-hover:ring-primary/40 transition-all" />
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                                Don't have a key? <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-primary hover:underline font-medium inline-flex items-center gap-1" rel="noreferrer">Get one free from Google AI Studio <ArrowRight className="size-3" /></a>
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="pb-8">
                    <Button onClick={handleSave} className="w-full text-base h-12 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all group">
                        <Sparkles className="mr-2 size-4 group-hover:animate-spin" />
                        Initialize System
                        <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
