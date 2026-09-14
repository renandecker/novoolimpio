import {useMemo, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {useAuth} from '../../features/auth/auth';
import {normalizeOutcome} from '../services/permissions';
import {useMenuIcon} from '../hooks/useIcones';
import './Sidebar.css';

type Modulo = { id: number; antecessorId: number | null; rotulo: string; descricao: string; icone: string; ajuda: string; outcome: string; ordem: number };

interface SidebarProps {
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

export default function Sidebar({onPhotoAction}: SidebarProps) {
    const {session} = useAuth();
    const {menuIcon} = useMenuIcon();
    const [expanded, setExpanded] = useState(false);
    const [search, setSearch] = useState('');

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
        return rawModulos.filter(m => !hiddenIds.has(m.id));
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
    const searchResults = useMemo(() => {
        if (!query) return null;
        const tokens = query.split(/\s+/);
        return flatItems.filter(item => {
            const haystack = `${item.label} ${item.parent ?? ''} ${item.keywords}`.toLowerCase();
            return tokens.every(t => haystack.includes(t));
        });
    }, [query, flatItems]);

    return (
        <aside
            className={`sidebar ${expanded ? 'expanded' : ''}`}
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
            onFocus={() => setExpanded(true)}
            onBlur={() => setExpanded(false)}
        >
            <div className="sidebar-header">
                <span className="sidebar-logo">O</span>
                <span className="sidebar-title">Olímpio</span>
            </div>
            <nav className="sidebar-nav">
                {expanded && (
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
                )}
                {searchResults ? (
                    searchResults.length === 0 ? (
                        <div className="sidebar-search-empty">Nenhum item encontrado</div>
                    ) : (
                        searchResults.map((item, index) => (
                            <Link
                                key={`${item.path}-${item.label}-${index}`}
                                className="sidebar-item sidebar-search-result"
                                to={item.path || '#'}
                            >
                                <span className="sidebar-icon">{item.icon}</span>
                                <span className="sidebar-label">
                                    {item.parent && <span className="sidebar-search-parent">{item.parent} › </span>}
                                    {item.label}
                                </span>
                            </Link>
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
