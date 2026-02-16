import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserSettingsState {
    googleApiKey: string;

    setGoogleApiKey: (key: string) => void;

    getApiKey: () => string;
}

export const useUserSettings = create<UserSettingsState>()(
    persist(
        (set, get) => ({
            googleApiKey: '',

            setGoogleApiKey: (key) => set({ googleApiKey: key }),

            getApiKey: () => {
                return get().googleApiKey;
            },
        }),
        {
            name: 'content-resonator-settings',
        }
    )
);
