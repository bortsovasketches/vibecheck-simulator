import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { useWizardStore } from '@/store/wizardStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  Zap,
  KeyRound,
} from 'lucide-react';

const steps = [
  { id: 'api-key', label: 'Connect', icon: KeyRound },
  { id: 'content-input', label: 'Input', icon: FileText },
  { id: 'persona-selection', label: 'Personas', icon: Users },
  { id: 'analysis', label: 'Analysis', icon: Zap },
  { id: 'report', label: 'Report', icon: LayoutDashboard },
] as const;

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentStep } = useWizardStore();
  const currentIndex = steps.findIndex((step) => step.id === currentStep);
  const dragRegionStyle = { WebkitAppRegion: 'drag' } as CSSProperties & {
    WebkitAppRegion: 'drag';
  };
  const noDragRegionStyle = { WebkitAppRegion: 'no-drag' } as CSSProperties & {
    WebkitAppRegion: 'no-drag';
  };

  return (
    <div className="app-shell h-screen w-full text-foreground overflow-hidden">
      <div className="mesh-grid" />
      <div className="fixed top-0 left-0 right-0 h-9 z-50" style={dragRegionStyle} />

      <div className="relative z-10 h-full flex">
        <aside
          className="hidden lg:flex w-72 p-5"
          style={noDragRegionStyle}
        >
          <div className="surface-panel w-full p-5 flex flex-col">
            <div className="flex items-center gap-3 pb-6 border-b border-border/70">
              <div className="size-11 rounded-xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-bold text-lg soft-ring">
                V
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Content Resonator</p>
                <h1 className="text-lg font-serif">Vibecheck OS</h1>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isCurrent = idx === currentIndex;
                const isDone = idx < currentIndex;
                return (
                  <div
                    key={step.id}
                    className={cn(
                      'rounded-xl border px-3 py-3 transition-all duration-200',
                      isCurrent
                        ? 'bg-primary/10 border-primary/35 text-foreground'
                        : isDone
                          ? 'bg-accent/10 border-accent/30'
                          : 'bg-white/60 border-border/75 text-muted-foreground'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'size-8 rounded-lg flex items-center justify-center',
                          isCurrent
                            ? 'bg-primary text-white'
                            : isDone
                              ? 'bg-accent text-white'
                              : 'bg-secondary text-muted-foreground'
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em]">Step {idx + 1}</p>
                        <p className="text-sm font-semibold">{step.label}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>


          </div>
        </aside>

        <main className="flex-1 min-w-0 h-full overflow-auto">
          <div className="lg:hidden sticky top-0 z-40 px-4 pt-12 pb-3 bg-background/80 backdrop-blur-md border-b border-border/70">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-serif">Vibecheck OS</h1>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Step {currentIndex + 1}/5</p>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-1.5">
              {steps.map((step, idx) => (
                <div
                  key={step.id}
                  className={cn(
                    'h-1.5 rounded-full',
                    idx <= currentIndex ? 'bg-primary' : 'bg-secondary'
                  )}
                />
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="max-w-7xl mx-auto h-full px-4 pb-5 pt-4 lg:pt-14 lg:px-8 lg:pb-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
