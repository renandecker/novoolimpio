import {useCallback, useEffect, useMemo, useState} from 'react';
import {api} from '../services/api';

export interface Icone {
    id: number;
    classe: string;
    icone: string;
    versao: '4.x' | '5.x' | '6.x';
    search?: string;
}

interface IconeCache {
    byClasse: Map<string, Icone>;
    byVersao: Map<string, Icone[]>;
    all: Icone[];
    loaded: boolean;
    loading: boolean;
}

const cache: IconeCache = {
    byClasse: new Map(),
    byVersao: new Map(),
    all: [],
    loaded: false,
    loading: false,
};

export function useIcones() {
    const [state, setState] = useState<IconeCache>(cache);

    const loadIcones = useCallback(async () => {
        if (cache.loaded || cache.loading) return;
        
        cache.loading = true;
        setState({...cache});
        
        try {
            const response = await api.get<Icone[]>('/api/icones');
            const icones = response.data;
            
            const byClasse = new Map<string, Icone>();
            const byVersao = new Map<string, Icone[]>();
            
            for (const icone of icones) {
                byClasse.set(icone.classe, icone);
                const list = byVersao.get(icone.versao) || [];
                list.push(icone);
                byVersao.set(icone.versao, list);
            }
            
            cache.byClasse = byClasse;
            cache.byVersao = byVersao;
            cache.all = icones;
            cache.loaded = true;
            cache.loading = false;
            
            setState({...cache});
        } catch (error) {
            console.error('Failed to load icons:', error);
            cache.loading = false;
            setState({...cache});
        }
    }, []);

    useEffect(() => {
        loadIcones();
    }, [loadIcones]);

    const getIconeByClasse = useCallback((classe: string): Icone | undefined => {
        return cache.byClasse.get(classe);
    }, []);

    const getIconesByVersao = useCallback((versao: string): Icone[] => {
        return cache.byVersao.get(versao) || [];
    }, []);

    const searchIcones = useCallback(async (termo: string): Promise<Icone[]> => {
        if (!termo.trim()) return cache.all;
        
        try {
            const response = await api.get<Icone[]>('/api/icones/search', {params: {q: termo}});
            return response.data;
        } catch (error) {
            console.error('Failed to search icons:', error);
            return cache.all.filter(i => 
                i.classe.toLowerCase().includes(termo.toLowerCase()) ||
                i.icone.toLowerCase().includes(termo.toLowerCase()) ||
                i.search?.toLowerCase().includes(termo.toLowerCase())
            );
        }
    }, []);

    return {
        icones: cache.all,
        loaded: cache.loaded,
        loading: cache.loading,
        getIconeByClasse,
        getIconesByVersao,
        searchIcones,
        reload: loadIcones,
    };
}

const normalizeName = (value: string) =>
    value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');

const FALLBACK_ICON_RULES: Array<[RegExp, string]> = [
    [/^paginainicial$/, '🏠'],
    [/^callcenter$/, '☎️'],
    [/^centraldeservico$/, '🛎️'],
    [/favorito/, '⭐'],
    [/senha/, '🔑'],
    [/impressora|digitalizacao|imprimir/, '🖨️'],
    [/mensagem|comunicacao/, '✉️'],
    [/^ligacao$/, '🎧'],
    [/^resultado.*ligacao/, '📊'],
    [/telefone/, '📞'],
    [/^tipodocanal$/, '📡'],
    [/campanha|marketing/, '📣'],
    [/^bairro$/, '🏘️'],
    [/^logradouro$/, '🛣️'],
    [/^mapa|^regiao$|gestaodelocais/, '🗺️'],
    [/^pais$|^estado$|^cidade$/, '🏙️'],
    [/unidade/, '🏢'],
    [/etnia|^genero$|^estadocivil$/, '🌍'],
    [/professor/, '👨‍🏫'],
    [/turma/, '🏫'],
    [/sala/, '🚪'],
    [/^periodo$|gestaodeperiodo/, '🗓️'],
    [/^horario$|^turno|^tempoaula$|^tipodepausa$/, '⏰'],
    [/agenda|^calendario|compromisso|^feriado$/, '📅'],
    [/^matricula$|^rematricula$|gestaodematricula|^escolaridade$|gestaodealuno/, '🎓'],
    [/oferecimentodeacao|prospecto/, '🎯'],
    [/^curso$|^tipodecurso$|gestaodecurso|^oferecimento|curricul|componentecurricular|^tipodematrizcurricular$|^grupocomponente|^grupodooferecimento$/, '🎓'],
    [/^pessoa$|^pessoafisica$|^usuario$|^perfil$|^coordenador$|^consultor$|^fornecedor$|^desistente$|^cpfalunosantigos$|^minhaconta$|^dados/, '👤'],
    [/pessoa/, '👥'],
    [/^caixa$|fluxodecaixa|gerenciafluxocaixa|configuracaocaixa/, '💵'],
    [/^contacorrente$|^contagestaocontas$/, '🏦'],
    [/pagamento|^parcela|^bandeira$|^valorproduto$|^diaspara/, '💳'],
    [/cobranca|^financeiro$|^movimentofinanceiro$/, '💰'],
    [/^estoque$|^produto|^pacote$|^marca$|^entrega$|controleestoque/, '📦'],
    [/^reservalivros$/, '🔖'],
    [/^devolucaolivros$/, '↩️'],
    [/livro|^biblioteca$|referencia/, '📚'],
    [/^grafico$|^indicador$|^estrategia$/, '📈'],
    [/^tabelas$/, '📋'],
    [/^filtros$/, '🔍'],
    [/^meta/, '🎯'],
    [/^dashboard$|^estruturarelatorio$|^extrator$|^organograma$|^tiposrelatorios$|^gerirnaps|^relatorio/, '📊'],
    [/^auditoria|^historico$/, '📜'],
    [/^documento|contrato|^arquivoprocon$/, '📄'],
    [/^modulo$|^estruturadosistema$|^paineis/, '🧩'],
    [/^gestaoconstrucao$|^configurac|^gestao$|^administrac/, '⚙️'],
    [/^basico$/, '📋'],
    [/^comercial$/, '🛒'],
    [/^academico$/, '🎓'],
    [/^aluno$/, '🎓'],
    [/^acao$|^tipodaacao$/, '🎯'],
    [/^nap$|atendimento|negociacao/, '🤝'],
    [/^centralnap$/, '📝'],
    [/^categoria|^subcategoria|^grupo$/, '🗂️'],
    [/^movimentacao/, '🔄'],
    [/^campo$/, '🧩'],
    [/^etapas/, '📋'],
    [/^resultado|^status|^crit|^grau$|^requisito|^motivo$/, '✅'],
    [/^saidas$/, '💸'],
    [/^custoporservico$/, '💲'],
    [/^avaliacao|^atividade$/, '📝'],
];

function fallbackIcon(rotulo: string): string {
    const name = normalizeName(rotulo);
    for (const [rule, emoji] of FALLBACK_ICON_RULES) if (rule.test(name)) return emoji;
    return '📁';
}

function renderFaIcon(classe: string, versao: string): React.ReactNode {
    if (versao === '4.x') {
        return <i className={classe} aria-hidden="true" />;
    }
    if (versao === '5.x') {
        return <i className={classe} aria-hidden="true" />;
    }
    if (versao === '6.x') {
        return <i className={classe} aria-hidden="true" />;
    }
    return <i className={classe} aria-hidden="true" />;
}

export function useMenuIcon() {
    const {icones, loaded, getIconeByClasse} = useIcones();

    const menuIcon = useCallback((rotulo: string, storedIcone?: string): React.ReactNode => {
        const stored = (storedIcone ?? '').trim();
        
        if (stored && !stored.startsWith('ui-icon') && !stored.startsWith('fa ')) {
            return stored;
        }
        
        if (stored && stored.startsWith('fa ')) {
            const icone = getIconeByClasse(stored);
            if (icone) {
                return renderFaIcon(icone.classe, icone.versao);
            }
        }
        
        if (loaded && icones.length > 0) {
            const name = normalizeName(rotulo);
            const matched = icones.find(i => {
                const searchTerms = (i.search || '').toLowerCase().split(/\s+/);
                return searchTerms.some(t => name.includes(t)) ||
                       i.classe.toLowerCase().includes(name) ||
                       name.includes(i.classe.toLowerCase().replace(/^fa[srbl]?\s+/, ''));
            });
            
            if (matched) {
                return renderFaIcon(matched.classe, matched.versao);
            }
        }
        
        return fallbackIcon(rotulo);
    }, [icones, loaded, getIconeByClasse]);

    return {menuIcon, iconesLoaded: loaded};
}