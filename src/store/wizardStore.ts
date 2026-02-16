import { create } from 'zustand';
import { generatePersonas, generateWildcard, type Persona, type InterviewResult, type FinalReport, type ContentMode } from '@/lib/ai';
import { useUserSettings } from './userSettings';

// Import Avatars
import avatar1 from '@/assets/avatars/avatar1.png';
import avatar2 from '@/assets/avatars/avatar2.png';
import avatar3 from '@/assets/avatars/avatar3.png';
import avatar4 from '@/assets/avatars/avatar4.png';
import avatar5 from '@/assets/avatars/avatar5.png';
import avatar6 from '@/assets/avatars/avatar6.png';

const avatars = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6];

export type WizardStep = 'api-key' | 'content-input' | 'persona-selection' | 'analysis' | 'report';

interface WizardState {
    currentStep: WizardStep;
    content: string;
    contentType: 'text' | 'youtube' | 'file';
    contentMode: ContentMode;
    generatedPersonas: Persona[];
    selectedPersonas: Persona[];
    interviewResults: InterviewResult[];
    finalReport: FinalReport | null;
    isGeneratingPersonas: boolean;
    isGeneratingWildcard: boolean;
    isAnalyzing: boolean;

    setStep: (step: WizardStep) => void;
    setContent: (content: string, type: 'text' | 'youtube' | 'file') => void;
    setContentMode: (mode: ContentMode) => void;
    setGeneratedPersonas: (personas: Persona[]) => void;
    generateInitialPersonas: () => Promise<void>;
    generateWildcardPersona: () => Promise<void>;
    addPersona: (persona: Persona) => void;
    togglePersonaSelection: (persona: Persona) => void;
    setInterviewResults: (results: InterviewResult[]) => void;
    setFinalReport: (report: FinalReport) => void;
    setIsGeneratingPersonas: (isGenerating: boolean) => void;
    setIsAnalyzing: (isAnalyzing: boolean) => void;
    reset: () => void;
}

export const useWizardStore = create<WizardState>((set) => ({
    currentStep: 'api-key',
    content: '',
    contentType: 'text',
    contentMode: 'standard',
    generatedPersonas: [],
    selectedPersonas: [],
    interviewResults: [],
    finalReport: null,
    isGeneratingPersonas: false,
    isGeneratingWildcard: false,
    isAnalyzing: false,

    setStep: (step) => set({ currentStep: step }),
    setContent: (content, type) => set({ content, contentType: type }),
    setContentMode: (mode) => set({ contentMode: mode }),
    setGeneratedPersonas: (personas) => set({ generatedPersonas: personas }),
    addPersona: (persona) => set((state) => ({ generatedPersonas: [...state.generatedPersonas, persona] })),

    togglePersonaSelection: (persona) => set((state) => {
        const isSelected = state.selectedPersonas.find(p => p.id === persona.id);
        if (isSelected) {
            return { selectedPersonas: state.selectedPersonas.filter(p => p.id !== persona.id) };
        } else {
            return { selectedPersonas: [...state.selectedPersonas, persona] };
        }
    }),

    setInterviewResults: (results) => set({ interviewResults: results }),
    setFinalReport: (report) => set({ finalReport: report }),
    setIsGeneratingPersonas: (isGenerating) => set({ isGeneratingPersonas: isGenerating }),

    generateInitialPersonas: async () => {
        const { content, contentMode, generatedPersonas, isGeneratingPersonas } = useWizardStore.getState();
        const apiKey = useUserSettings.getState().googleApiKey;

        if (!content || !apiKey || generatedPersonas.length > 0 || isGeneratingPersonas) return;

        set({ isGeneratingPersonas: true });
        try {
            const personas = await generatePersonas(content, apiKey, contentMode);

            // Assign random avatars ensuring unique distribution if possible
            const shuffledAvatars = [...avatars].sort(() => 0.5 - Math.random());
            const personasWithAvatars = personas.map((p, i) => ({
                ...p,
                avatar: shuffledAvatars[i % shuffledAvatars.length]
            }));

            set({ generatedPersonas: personasWithAvatars });
        } catch (e) {
            console.error("Persona generation failed:", e);
        } finally {
            set({ isGeneratingPersonas: false });
        }
    },

    generateWildcardPersona: async () => {
        const { content, addPersona, isGeneratingWildcard } = useWizardStore.getState();
        const apiKey = useUserSettings.getState().googleApiKey;
        const generatedPersonasCount = useWizardStore.getState().generatedPersonas.length;

        if (!content || !apiKey || isGeneratingWildcard) return;

        set({ isGeneratingWildcard: true });
        try {
            const wildcard = await generateWildcard(content, apiKey);

            // Assign a random avatar for wildcard too
            const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
            const wildcardWithAvatar = { ...wildcard, avatar: randomAvatar };

            addPersona(wildcardWithAvatar);
        } catch (e) {
            console.error("Wildcard generation failed:", e);
        } finally {
            set({ isGeneratingWildcard: false });
        }
    },

    setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing: isAnalyzing }),

    reset: () => set({
        currentStep: 'content-input',
        content: '',
        contentType: 'text',
        contentMode: 'standard',
        generatedPersonas: [],
        selectedPersonas: [],
        interviewResults: [],
        finalReport: null,
        isGeneratingPersonas: false,
        isGeneratingWildcard: false,
        isAnalyzing: false,
    }),
}));
