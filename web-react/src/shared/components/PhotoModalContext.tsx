import {createContext, useContext, useState, type ReactNode, useCallback} from 'react';

interface PhotoModalContextType {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    currentFoto?: string;
    username?: string;
    onPhotoUpdate: (fotoUrl: string) => void;
}

const PhotoModalContext = createContext<PhotoModalContextType | null>(null);

export function PhotoModalProvider({children}: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentFoto, setCurrentFoto] = useState<string | undefined>(undefined);
    const [username, setUsername] = useState<string | undefined>(undefined);

    const open = useCallback((foto?: string, user?: string) => {
        if (foto !== undefined) setCurrentFoto(foto);
        if (user !== undefined) setUsername(user);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    const onPhotoUpdate = useCallback((fotoUrl: string) => {
        setCurrentFoto(fotoUrl);
    }, []);

    return (
        <PhotoModalContext.Provider value={{isOpen, open, close, currentFoto, username, onPhotoUpdate}}>
            {children}
        </PhotoModalContext.Provider>
    );
}

export function usePhotoModal() {
    const ctx = useContext(PhotoModalContext);
    if (!ctx) throw new Error('usePhotoModal deve ser usado dentro de PhotoModalProvider');
    return ctx;
}