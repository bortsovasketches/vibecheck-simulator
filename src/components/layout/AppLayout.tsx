import { motion } from 'framer-motion';
import { useWizardStore } from '@/store/wizardStore';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    Zap
} from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
    const { currentStep } = useWizardStore();

    // Map internal step IDs to UI steps for the sidebar
    // We only show the main 3 steps in the sidebar for simplicity in this Artisan view
    const mainSteps = [
        { id: 'content-input', label: 'Input', icon: FileText },
        { id: 'persona-selection', label: 'Personas', icon: Users },
        { id: 'analysis', label: 'Analysis', icon: Zap },
        { id: 'report', label: 'Report', icon: LayoutDashboard },
    ];

    const getStepStatus = (stepId: string) => {
        const stepOrder = ['api-key', 'content-input', 'persona-selection', 'analysis', 'report'];
        const currentIndex = stepOrder.indexOf(currentStep);
        const stepIndex = stepOrder.indexOf(stepId);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'upcoming';
    };

    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans selection:bg-primary/20 selection:text-primary">
            {/* Modernized Floating Sidebar - Added margin on all sides, proper shadow */}
            <aside className="w-20 lg:w-24 my-6 ml-6 rounded-3xl glass-panel flex flex-col items-center justify-between py-8 z-[100] shadow-2xl border border-white/5">
                {/* Brand Logo */}
                <div className="size-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:scale-105 transition-transform duration-300 cursor-pointer">
                    <span className="font-serif font-black text-white text-2xl">V</span>
                </div>

                {/* Navigation Dock */}
                <div className="flex flex-col gap-6 w-full px-2">
                    {mainSteps.map((step) => {
                        const status = getStepStatus(step.id);
                        const isActive = status === 'current';
                        const isCompleted = status === 'completed';

                        return (
                            <div key={step.id} className="relative group flex flex-col items-center gap-1 cursor-default">
                                <div
                                    className={cn(
                                        "size-12 rounded-xl flex items-center justify-center transition-all duration-300 relative",
                                        isActive ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110" :
                                            isCompleted ? "bg-primary/10 text-primary" :
                                                "bg-transparent text-muted-foreground hover:bg-muted/30"
                                    )}
                                >
                                    <step.icon className={cn("size-5 transition-transform", isActive && "animate-pulse")} />

                                    {/* Active Indicator Dot */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-nav"
                                            className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full"
                                        />
                                    )}
                                </div>
                                <span className={cn(
                                    "text-[9px] font-mono uppercase tracking-wider transition-opacity duration-300",
                                    isActive ? "opacity-100 font-bold text-primary" : "opacity-0 group-hover:opacity-100 text-muted-foreground"
                                )}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Settings / Footer */}
                <div className="flex flex-col gap-4">
                    <div className="size-10 rounded-full hover:bg-muted/50 flex items-center justify-center transition-colors cursor-pointer text-muted-foreground hover:text-foreground">
                        <Settings className="size-5" />
                    </div>
                </div>
            </aside>

            {/* Main Content Area - removed relative offset, centered correctly */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    {/* Background gradient handled in index.css body */}
                </div>
                {/* Increased max-width and adjusted padding for breathing room */}
                <div className="relative z-10 w-full max-w-7xl h-full p-6 lg:p-10 mx-auto flex flex-col">
                    {children}
                </div>
            </main>
        </div>
    );
}
