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
  const initials = persona.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <motion.div layout whileHover={{ y: -2 }} whileTap={{ scale: 0.995 }} className="h-full">
      <div
        className={cn(
          'surface-panel h-full flex flex-col cursor-pointer transition-all duration-200 relative overflow-hidden border',
          isSelected ? 'border-primary/45 soft-ring' : 'border-border/90 hover:border-primary/25'
        )}
        onClick={() => onToggle(persona)}
      >
        {isSelected && (
          <div className="absolute top-3 right-3 z-20 rounded-lg bg-primary text-white p-1.5 shadow-sm">
            <Check className="size-3.5" />
          </div>
        )}

        {isWildcard && (
          <div className="absolute top-3 left-3 z-20">
            <Badge className="gap-1 bg-amber-500/10 text-amber-700 border-amber-300/60">
              <Sparkles className="size-3" /> Wildcard
            </Badge>
          </div>
        )}

        <CardHeader className="flex flex-row items-center gap-3 pb-1 pt-6 px-5 space-y-0">
          <div className={cn('size-12 rounded-full flex items-center justify-center shrink-0 font-bold text-sm overflow-hidden border border-border/70', avatarColorClass)}>
            {persona.avatar ? (
              <img src={persona.avatar} alt={persona.name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="font-serif text-lg leading-tight truncate pr-6">{persona.name}</h3>
            <p className="text-[11px] text-muted-foreground uppercase tracking-[0.18em] truncate">{persona.role}</p>
          </div>
        </CardHeader>

        <CardContent className="px-5 py-3 flex-grow">
          <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">{persona.description}</p>
        </CardContent>

        <CardFooter className="px-5 pb-5 pt-0 flex flex-col items-start gap-2.5">
          {persona.painPoints && persona.painPoints.length > 0 && (
            <div className="w-full space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-rose-700 uppercase tracking-[0.2em]">
                <AlertTriangle className="size-3" /> Pain points
              </div>
              <div className="flex flex-wrap gap-1.5">
                {persona.painPoints.slice(0, 3).map((point: string, i: number) => (
                  <Badge key={i} variant="secondary" className="rounded-md text-[10px] py-0.5 px-1.5">
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
