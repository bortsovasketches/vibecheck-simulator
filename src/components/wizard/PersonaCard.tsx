import { motion } from 'framer-motion';
import { CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Check, AlertTriangle, Sparkles } from 'lucide-react';
import { type Persona } from '@/lib/ai';

interface PersonaCardProps {
    persona: Persona;
    isSelected: boolean;
    onToggle: (persona: Persona) => void;
    isWildcard?: boolean;
}

export function PersonaCard({ persona, isSelected, onToggle, isWildcard }: PersonaCardProps) {
    // Generate a consistent color based on the name for the avatar bg
    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-red-100 text-red-600',
            'bg-orange-100 text-orange-600',
            'bg-amber-100 text-amber-600',
            'bg-green-100 text-green-600',
            'bg-emerald-100 text-emerald-600',
            'bg-teal-100 text-teal-600',
            'bg-cyan-100 text-cyan-600',
            'bg-sky-100 text-sky-600',
            'bg-blue-100 text-blue-600',
            'bg-indigo-100 text-indigo-600',
            'bg-violet-100 text-violet-600',
            'bg-purple-100 text-purple-600',
            'bg-fuchsia-100 text-fuchsia-600',
            'bg-pink-100 text-pink-600',
            'bg-rose-100 text-rose-600',
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const avatarColorClass = getAvatarColor(persona.name);
    const initials = persona.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="h-full"
        >
            <div
                className={cn(
                    "artisan-card h-full flex flex-col cursor-pointer transition-all duration-300 relative overflow-hidden group border-2",
                    isSelected ? "border-primary shadow-xl ring-2 ring-primary/20 scale-[1.02]" : "border-border hover:border-border/80"
                )}
                onClick={() => onToggle(persona)}
            >
                {/* Selection Indicator */}
                <div className={cn(
                    "absolute top-0 right-0 p-2 z-10 transition-all duration-300",
                    isSelected ? "opacity-100" : "opacity-0"
                )}>
                    <div className="bg-primary text-primary-foreground rounded-bl-xl rounded-tr-lg p-1.5 shadow-sm">
                        <Check className="size-4" />
                    </div>
                </div>

                {isWildcard && (
                    <div className="absolute top-0 left-0 z-10">
                        <div className="bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-xl shadow-sm flex items-center gap-1">
                            <Sparkles className="size-3" /> WILDCARD
                        </div>
                    </div>
                )}

                <CardHeader className="flex flex-row items-center gap-4 pb-2 pt-6 px-5 space-y-0">
                    <div className={cn("size-12 rounded-full flex items-center justify-center shrink-0 shadow-inner font-bold text-lg overflow-hidden border border-border/50", avatarColorClass)}>
                        {persona.avatar ? (
                            <img src={persona.avatar} alt={persona.name} className="w-full h-full object-cover" />
                        ) : (
                            initials
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h3 className="font-serif font-semibold text-lg leading-tight truncate pr-6">{persona.name}</h3>
                        <p className="text-xs font-sans text-muted-foreground font-medium uppercase tracking-wider truncate">{persona.role}</p>
                    </div>
                </CardHeader>

                <CardContent className="px-5 py-2 flex-grow">
                    <p className="text-sm text-gray-500 font-normal leading-relaxed line-clamp-3">
                        {persona.description}
                    </p>
                </CardContent>

                <CardFooter className="px-5 pb-5 pt-2 flex flex-col items-start gap-3">
                    {persona.painPoints && persona.painPoints.length > 0 && (
                        <div className="w-full space-y-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-700 uppercase tracking-widest opacity-90 font-sans">
                                <AlertTriangle className="size-3" />
                                Pain Points
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {persona.painPoints.slice(0, 3).map((point: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-100 rounded-md px-1.5 py-0.5 text-[10px] font-medium pointer-events-none">
                                        {point}
                                    </Badge>
                                ))}
                                {persona.painPoints.length > 3 && (
                                    <span className="text-[10px] text-muted-foreground self-center">+{persona.painPoints.length - 3}</span>
                                )}
                            </div>
                        </div>
                    )}
                </CardFooter>
            </div>
        </motion.div>
    );
}
