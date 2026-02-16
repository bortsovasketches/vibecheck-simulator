import { useState } from 'react';
import { useUserSettings } from '@/store/userSettings';
import { useWizardStore } from '@/store/wizardStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowRight, KeyRound, Orbit } from 'lucide-react';
import { motion } from 'framer-motion';

export function ApiKeyStep() {
  const { googleApiKey, setGoogleApiKey } = useUserSettings();
  const { setStep } = useWizardStore();
  const [localGoogleKey, setLocalGoogleKey] = useState(googleApiKey || '');

  const handleSave = () => {
    if (!localGoogleKey.trim()) {
      toast.error('Please enter a Google API key');
      return;
    }

    setGoogleApiKey(localGoogleKey);
    toast.success('API key saved');
    setStep('content-input');
  };

  return (
    <div className="h-full flex items-center justify-center px-2 py-6 lg:py-10">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Card className="relative overflow-hidden">
          <div className="absolute -top-20 -right-20 size-52 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-52 rounded-full bg-accent/15 blur-3xl" />

          <CardHeader className="relative z-10 pb-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs text-primary w-fit">
              <Orbit className="size-3.5" /> Secure Setup
            </div>
            <CardTitle className="mt-3 text-3xl">Connect Gemini</CardTitle>
            <CardDescription className="max-w-xl text-sm leading-relaxed">
              Add your Google Gemini API key to power persona generation and analysis. The key is stored locally on this device.
            </CardDescription>
          </CardHeader>

          <CardContent className="relative z-10 space-y-3">
            <Label htmlFor="google-key" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              API Credential
            </Label>
            <Input
              id="google-key"
              type="password"
              placeholder="AIzaSy..."
              value={localGoogleKey}
              onChange={(e) => setLocalGoogleKey(e.target.value)}
              className="h-12 font-medium"
            />
            <p className="text-xs text-muted-foreground">
              Need one?{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                Generate a key in Google AI Studio
              </a>
              .
            </p>
          </CardContent>

          <CardFooter className="relative z-10 pt-3">
            <Button onClick={handleSave} className="w-full sm:w-auto h-11 px-6">
              <KeyRound className="size-4" /> Save and Continue <ArrowRight className="size-4" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
