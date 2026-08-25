import {createContext, useContext, useEffect, useMemo, useState, type ReactNode} from 'react';
import {api} from './api';
import {useAuth} from './auth';

export type TemaConfig = {
    id?: number;
    tema?: string;
    titulo?: string;
    corPrimaria?: string;
    corSecundaria?: string;
    corBarra?: string;
    corFundo?: string;
    corTexto?: string;
    corBorda?: string;
    corDestaque?: string;
    corEmail?: string;
    posicaoLogo?: string;
    loginPosicao?: string;
};

type ThemeContextType = {
    tema: TemaConfig | null;
    recarregarTema: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_THEME: TemaConfig = {
    corPrimaria: '#2f333b',
    corSecundaria: '#3baae3',
    corBarra: '#24272e',
    corFundo: '#f1f1f1',
    corTexto: '#ffffff',
    corBorda: '#c2aa3c',
    corDestaque: '#3baae3',
    posicaoLogo: 'left',
    loginPosicao: 'center',
};

export function ThemeProvider({children}: { children: ReactNode }) {
    const {session} = useAuth();
    const [tema, setTema] = useState<TemaConfig | null>(null);

    const carregarTema = async () => {
        if (!session) {
            setTema(null);
            return;
        }
        try {
            // 1) Prioridade máxima: Buscar diretamente nos temas cadastrados aquele que possui o flag padrão (`fl_default = true`)
            const temasRes = await api.get<any[]>('/api/login/temas');
            const temasList = temasRes.data ?? [];
            const temaPadrao = temasList.find((t: any) => t.fl_default === true || t.flDefault === true);
            if (temaPadrao) {
                setTema(temaPadrao);
                aplicarCoresNoDom(temaPadrao);
                return;
            }

            // 2) Segunda prioridade: Tentar buscar o layout ativo configurado no sistema
            const res = await api.get<any>('/api/view/configuracao/listLayout/paged?size=1');
            const content = res.data?.content ?? [];
            if (content.length > 0) {
                const layoutItem = content[0];
                const temaNome = layoutItem.tema;
                if (temaNome) {
                    const encontrado = temasList.find((t: any) => t.tema === temaNome || t.id === layoutItem.id_tema);
                    if (encontrado) {
                        setTema(encontrado);
                        aplicarCoresNoDom(encontrado);
                        return;
                    }
                }
            }

            // 3) Fallback: se não encontrou padrão nem layout, pega o primeiro tema disponível
            if (temasList.length > 0) {
                const def = temasList[0];
                setTema(def);
                aplicarCoresNoDom(def);
            }
        } catch (e) {
            console.error('Erro ao carregar tema do sistema:', e);
            aplicarCoresNoDom(DEFAULT_THEME);
        }
    };

    useEffect(() => {
        carregarTema();
    }, [session]);

    // Listener para eventos de atualização de tema em tempo real
    useEffect(() => {
        const handleTemaUpdated = () => {
            carregarTema();
        };
        window.addEventListener('olimpio-tema-updated', handleTemaUpdated);
        return () => window.removeEventListener('olimpio-tema-updated', handleTemaUpdated);
    }, [session]);

    const aplicarCoresNoDom = (t: TemaConfig) => {
        const root = document.documentElement;
        if (t.corPrimaria) root.style.setProperty('--cor-primaria', t.corPrimaria);
        if (t.corSecundaria) root.style.setProperty('--cor-secundaria', t.corSecundaria);
        if (t.corBarra) root.style.setProperty('--cor-barra', t.corBarra);
        if (t.corFundo) root.style.setProperty('--cor-fundo', t.corFundo);
        if (t.corTexto) root.style.setProperty('--cor-texto', t.corTexto);
        if (t.corBorda) root.style.setProperty('--cor-borda', t.corBorda);
        if (t.corDestaque) root.style.setProperty('--cor-destaque', t.corDestaque);
    };

    const value = useMemo(() => ({
        tema,
        recarregarTema: carregarTema,
    }), [tema]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('ThemeProvider ausente');
    return context;
};
