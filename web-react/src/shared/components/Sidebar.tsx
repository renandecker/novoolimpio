import {useEffect, useMemo, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {useAuth} from '../../features/auth/auth';
import {normalizeOutcome} from '../services/permissions';
import {useMenuIcon} from '../hooks/useIcones';
import './Sidebar.css';

type Modulo = { id: number; antecessorId: number | null; rotulo: string; descricao: string; icone: string; ajuda: string; outcome: string; ordem: number };

interface SidebarProps {
    open: boolean;
    onClose: () => void;
    onPhotoAction?: () => void;
}

const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path
            d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
);

const HIDDEN_ROTULOS = new Set([
    'gestaodecontrato',
    'gestaodecurriculo',
    'curriculoempresa',
    'situacaocontrato',
    'tipodematrizcurricular',
    'grupocomponentecurricular',
    'cronogramacomponentecurricular',
    'auditoriahistorico',
    'modulo',
    'pacote',
]);
const HIDDEN_OUTCOMES = [
    '/view/contratoSituacao',
    '/view/tipoMatrizCurricular',
    '/view/grupoComponenteCurricular',
    '/view/cronogramaComponenteCurricular',
    '/view/auditoria/listauditoriahistorico',
    '/view/auditoria/formauditoriahistorico',
    '/view/modulo/listModulo',
    '/view/modulo/formModulo',
    '/view/pacote/listPacote',
    '/view/pacote/formPacote',
];
const CONFIGURACAO_DOCUMENTOS_OUTCOME = '/view/configuracao/listDocumentos';

// Legado (V58): o grupo "Acesso do Aluno" foi renomeado no banco para "Portal Aluno".
// Normaliza o grupo na exibição (a V97 corrige o banco e a V98 restaura o subitem
// "Portal Aluno" com a tela do painel).
const PORTAL_ALUNO_NOMES = new Set(['portalaluno', 'portaldoaluno']);
const ACESSO_ALUNO_NOME = 'acessodoaluno';
const BIB_FISICA_OUTCOME = '/aluno/biblioteca-fisica';
const BIB_VIRTUAL_OUTCOME = '/aluno/biblioteca-virtual';

function normalizeRotulo(value: string): string {
    return (value ?? '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
}

function isHiddenModulo(m: Modulo): boolean {
    const normalizeName = (value: string) =>
        value
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '');
    if (HIDDEN_ROTULOS.has(normalizeName(m.rotulo))) return true;
    const out = (m.outcome || '').toLowerCase();
    return HIDDEN_OUTCOMES.some(p => out.startsWith(p.toLowerCase()));
}

export default function Sidebar({open, onClose, onPhotoAction}: SidebarProps) {
    const {session} = useAuth();
    const {menuIcon} = useMenuIcon();
    const location = useLocation();
    const [search, setSearch] = useState('');

    // Fecha o drawer ao navegar (padrão Drawer do react-navigation)
    useEffect(() => {
        onClose();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    // ESC fecha + trava scroll do body enquanto aberto
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [open, onClose]);

    const rawModulos = (session?.modules ?? []) as Modulo[];
    // Filtra módulos ocultos e também filhos de módulos ocultos (recursivo)
    const modulos = useMemo(() => {
        const hiddenIds = new Set<number>();
        for (const m of rawModulos) if (isHiddenModulo(m)) hiddenIds.add(m.id);
        // propaga para descendentes
        let changed = true;
        while (changed) {
            changed = false;
            for (const m of rawModulos) {
                if (!hiddenIds.has(m.id) && m.antecessorId != null && hiddenIds.has(m.antecessorId)) {
                    hiddenIds.add(m.id);
                    changed = true;
                }
            }
        }
        const base = rawModulos.filter(m => !hiddenIds.has(m.id));
        const childCount = new Map<number, number>();
        for (const m of base) {
            if (m.antecessorId != null) childCount.set(m.antecessorId, (childCount.get(m.antecessorId) ?? 0) + 1);
        }
        // 1) Renomeia o grupo legado "Portal Aluno" (com filhos ou raiz) para "Acesso do Aluno".
        //    O grupo vira apenas expansor (sem outcome próprio) para não duplicar o destino
        //    do painel do aluno, que segue acessível pela raiz "Aluno".
        const renamed = base.map(m => {
            if (!PORTAL_ALUNO_NOMES.has(normalizeRotulo(m.rotulo))) return m;
            const isGroup = (childCount.get(m.id) ?? 0) > 0;
            if (!isGroup && m.antecessorId != null) return m; // folha: tratada no passo 2
            return {...m, rotulo: 'Acesso do Aluno', outcome: isGroup ? '' : m.outcome};
        });
        // 2) O subitem "Portal Aluno" (tela do painel, /aluno/portalAluno) é mantido
        //    dentro do "Acesso do Aluno", junto aos demais subitens.
        const withoutDupes = renamed;
        // 3) Garante "Biblioteca Fisica" e "Biblioteca Virtual" dentro do "Acesso do
        //    Aluno" mesmo quando o banco ainda não foi migrado (V97).
        const result = [...withoutDupes];
        const acessoGroup = result.find(m => normalizeRotulo(m.rotulo) === ACESSO_ALUNO_NOME && (childCount.get(m.id) ?? 0) > 0)
            ?? result.find(m => normalizeRotulo(m.rotulo) === ACESSO_ALUNO_NOME);
        if (acessoGroup) {
            const outcomes = new Set(result.map(m => (m.outcome ?? '').replace(/\.xhtml$/i, '')));
            const maxId = result.reduce((acc, m) => Math.max(acc, m.id), 0);
            if (!outcomes.has(BIB_FISICA_OUTCOME)) {
                result.push({
                    id: Math.min(-1, maxId > 0 ? -(maxId + 1) : -1),
                    antecessorId: acessoGroup.id,
                    rotulo: 'Biblioteca Fisica',
                    descricao: 'Acervo físico do aluno',
                    icone: '📚',
                    ajuda: 'Reservas, empréstimos, multas e livros disponíveis.',
                    outcome: BIB_FISICA_OUTCOME,
                    ordem: 7,
                });
            }
            if (!outcomes.has(BIB_VIRTUAL_OUTCOME)) {
                result.push({
                    id: Math.min(-2, maxId > 0 ? -(maxId + 2) : -2),
                    antecessorId: acessoGroup.id,
                    rotulo: 'Biblioteca Virtual',
                    descricao: 'Livros virtuais dos fornecedores',
                    icone: '💻',
                    ajuda: 'Acesso aos livros virtuais dos fornecedores.',
                    outcome: BIB_VIRTUAL_OUTCOME,
                    ordem: 8,
                });
            }
        }
        return result;
    }, [rawModulos]);
    const defaultPath = session?.defaultOutcome || '/default';

    const childrenByParent = useMemo(() => {
        const map = new Map<number, Modulo[]>();
        for (const m of modulos) {
            if (m.antecessorId != null) {
                const list = map.get(m.antecessorId) ?? [];
                list.push(m);
                map.set(m.antecessorId, list);
            }
        }
        for (const list of map.values()) list.sort((a, b) => a.ordem - b.ordem);
        return map;
    }, [modulos]);

    const topModulos = modulos.filter(m => m.antecessorId == null).sort((a, b) => a.ordem - b.ordem);

    const flatItems = useMemo(() => {
        const items: { label: string; parent: string | null; path: string; icon: React.ReactNode; keywords: string }[] = [
            {label: 'Início', parent: null, path: defaultPath, icon: menuIcon('paginainicial'), keywords: 'inicio paginainicial'},
            {label: 'Configuração Documentos', parent: null, path: CONFIGURACAO_DOCUMENTOS_OUTCOME, icon: menuIcon('configuracao documentos'), keywords: 'configuracao documentos relatorios'},
            {label: 'Fiserv', parent: null, path: '/view/fiserv/cartao-pessoa', icon: menuIcon('fiserv'), keywords: 'fiserv cartao pagamento'},
            {label: 'Biblioteca', parent: null, path: '/view/biblioteca-fisica/obra/list', icon: menuIcon('biblioteca'), keywords: 'biblioteca acervo livro emprestimo'},
            {label: 'Biblioteca Virtual', parent: null, path: '/view/biblioteca-virtual/livro-digital/list', icon: menuIcon('biblioteca virtual'), keywords: 'biblioteca virtual digital livro licenca'},
        ];
        const walk = (modulo: Modulo, parent: string | null) => {
            items.push({
                label: modulo.rotulo,
                parent,
                path: normalizeOutcome(modulo.outcome),
                icon: menuIcon(modulo.rotulo, modulo.icone),
                keywords: `${modulo.rotulo} ${modulo.descricao} ${modulo.outcome}`,
            });
            for (const child of childrenByParent.get(modulo.id) ?? []) walk(child, modulo.rotulo);
        };
        for (const m of topModulos) walk(m, null);
        return items;
    }, [modulos, childrenByParent, topModulos, defaultPath, menuIcon]);

    const query = search.trim().toLowerCase();
    
    // Função para filtrar a árvore mantendo a hierarquia
    const filterTree = (items: Modulo[], parentLabel: string | null = null): { modulo: Modulo; children: any[] }[] => {
        if (!query) return [];
        const tokens = query.split(/\s+/);
        return items
            .map(m => {
                const children = filterTree(childrenByParent.get(m.id) ?? [], m.rotulo);
                const haystack = `${m.rotulo} ${m.descricao} ${m.outcome} ${parentLabel ?? ''}`.toLowerCase();
                const matches = tokens.every(t => haystack.includes(t));
                if (matches || children.length > 0) {
                    return { modulo: m, children };
                }
                return null;
            })
            .filter((x): x is { modulo: Modulo; children: any[] } => x !== null);
    };

    const searchTree = useMemo(() => filterTree(topModulos), [query, topModulos, childrenByParent]);
    
    // Para resultados de busca flat (compatibilidade com código existente)
    const searchResults = useMemo(() => {
        if (!query) return null;
        const tokens = query.split(/\s+/);
        return flatItems.filter(item => {
            const haystack = `${item.label} ${item.parent ?? ''} ${item.keywords}`.toLowerCase();
            return tokens.every(t => haystack.includes(t));
        });
    }, [query, flatItems]);

    return (
        <>
            <div
                className={`sidebar-backdrop ${open ? 'visible' : ''}`}
                onClick={onClose}
                aria-hidden={!open}
            />
            <aside
                className={`sidebar ${open ? 'open' : ''}`}
                aria-hidden={!open}
                aria-label="Menu lateral"
            >
            <div className="sidebar-header">
                <span className="sidebar-logo">O</span>
                <span className="sidebar-title">Olímpio</span>
                <button type="button" className="sidebar-close" onClick={onClose} aria-label="Fechar menu">
                    ×
                </button>
            </div>
            {/* Busca fixa no topo do drawer */}
            <div className="sidebar-search">
                <span className="sidebar-search-icon"><SearchIcon/></span>
                <input
                    type="text"
                    className="sidebar-search-input"
                    placeholder="Buscar menu ou tela..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    aria-label="Buscar menu ou tela"
                />
                {search && (
                    <button type="button" className="sidebar-search-clear" onClick={() => setSearch('')}
                            aria-label="Limpar busca">
                        ×
                    </button>
                )}
            </div>
            <nav className="sidebar-nav">
                {query ? (
                    searchTree.length === 0 ? (
                        <div className="sidebar-search-empty">Nenhum item encontrado</div>
                    ) : (
                        searchTree.map((node, index) => (
                            <SearchTreeItem
                                key={`${node.modulo.id}-${index}`}
                                node={node}
                                childrenByParent={childrenByParent}
                                menuIcon={menuIcon}
                                onPhotoAction={onPhotoAction}
                            />
                        ))
                    )
                ) : (
                    <>
                        <Link className="sidebar-item" to={defaultPath}>
                            <span className="sidebar-icon">{menuIcon('paginainicial')}</span>
                            <span className="sidebar-label">Início</span>
                        </Link>

                        {topModulos.map(modulo => (
                            <SidebarItem key={modulo.id} modulo={modulo} childrenByParent={childrenByParent} depth={0} menuIcon={menuIcon} onPhotoAction={onPhotoAction}/>
                        ))}
                    </>
                )}
            </nav>
        </aside>
        </>
    );
}

function SearchTreeItem({node, childrenByParent, menuIcon, onPhotoAction}: { node: { modulo: Modulo; children: any[] }; childrenByParent: Map<number, Modulo[]>; menuIcon: (rotulo: string, icone?: string) => React.ReactNode; onPhotoAction?: () => void }) {
    const location = useLocation();
    const [open, setOpen] = useState(true); // Começa aberto na busca
    const { modulo, children } = node;
    const isGroup = children.length > 0;
    const outcome = normalizeOutcome(modulo.outcome);
    const active = Boolean(outcome) && location.pathname.includes(outcome);
    const isPhotoAction = modulo.outcome === '/meus-dados/foto' || modulo.rotulo.toLowerCase() === 'alterar foto';

    if (!isGroup) {
        if (isPhotoAction) {
            return (
                <button
                    className="sidebar-item sidebar-search-result"
                    onClick={onPhotoAction}
                    type="button"
                >
                    <span className="sidebar-icon">{menuIcon(modulo.rotulo, modulo.icone)}</span>
                    <span className="sidebar-label">{modulo.rotulo}</span>
                </button>
            );
        }
        return (
            <Link
                className={`sidebar-item sidebar-search-result ${active ? 'active' : ''}`}
                to={outcome || '#'}
            >
                <span className="sidebar-icon">{menuIcon(modulo.rotulo, modulo.icone)}</span>
                <span className="sidebar-label">{modulo.rotulo}</span>
            </Link>
        );
    }

    return (
        <div className="sidebar-group">
            <button className="sidebar-item sidebar-group-header sidebar-search-result"
                    onClick={() => setOpen(prev => !prev)}>
                <span className="sidebar-icon">{menuIcon(modulo.rotulo, modulo.icone)}</span>
                <span className="sidebar-label">{modulo.rotulo}</span>
                <span className="sidebar-arrow">{open ? '▾' : '▸'}</span>
            </button>
            {open && (
                <div className="sidebar-submenu">
                    {children.map(child => (
                        <SearchTreeItem key={child.modulo.id} node={child} childrenByParent={childrenByParent}
                                         menuIcon={menuIcon} onPhotoAction={onPhotoAction}/>
                    ))}
                </div>
            )}
        </div>
    );
}

function SidebarItem({modulo, childrenByParent, depth, menuIcon, onPhotoAction}: { modulo: Modulo; childrenByParent: Map<number, Modulo[]>; depth: number; menuIcon: (rotulo: string, icone?: string) => React.ReactNode; onPhotoAction?: () => void }) {
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const children = childrenByParent.get(modulo.id) ?? [];
    const isGroup = children.length > 0;
    const isSub = depth > 0;
    const outcome = normalizeOutcome(modulo.outcome);
    const active = Boolean(outcome) && location.pathname.includes(outcome);
    const isPhotoAction = modulo.outcome === '/meus-dados/foto' || modulo.rotulo.toLowerCase() === 'alterar foto';

    if (!isGroup) {
        if (isPhotoAction) {
            return (
                <button
                    className={`sidebar-item ${isSub ? 'sidebar-subitem' : ''}`}
                    onClick={onPhotoAction}
                    type="button"
                >
                    <span className="sidebar-icon">{menuIcon(modulo.rotulo, modulo.icone)}</span>
                    <span className="sidebar-label">{modulo.rotulo}</span>
                </button>
            );
        }
        return (
            <Link
                className={`sidebar-item ${isSub ? 'sidebar-subitem' : ''} ${active ? 'active' : ''}`}
                to={outcome || '#'}
            >
                <span className="sidebar-icon">{menuIcon(modulo.rotulo, modulo.icone)}</span>
                <span className="sidebar-label">{modulo.rotulo}</span>
            </Link>
        );
    }

    return (
        <div className="sidebar-group">
            <button className={`sidebar-item sidebar-group-header ${isSub ? 'sidebar-subitem' : ''}`}
                    onClick={() => setOpen(prev => !prev)}>
                <span className="sidebar-icon">{menuIcon(modulo.rotulo, modulo.icone)}</span>
                <span className="sidebar-label">{modulo.rotulo}</span>
                <span className="sidebar-arrow">{open ? '▾' : '▸'}</span>
            </button>
            {open && (
                <div className="sidebar-submenu">
                    {children.map(child => (
                        <SidebarItem key={child.id} modulo={child} childrenByParent={childrenByParent}
                                     depth={depth + 1} menuIcon={menuIcon} onPhotoAction={onPhotoAction}/>
                    ))}
                </div>
            )}
        </div>
    );
}
