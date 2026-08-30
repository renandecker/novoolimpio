import {useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import {LISTA_ICONES, escopoPorClasse, type Icone} from '../utils/icones';
import './IconPicker.css';

export interface IconPickerProps {
    open: boolean;
    onClose: () => void;
    onSelect: (icone: Icone) => void;
    selected?: string | null;
    title?: string;
    columns?: number;
}

export default function IconPicker({
                                       open,
                                       onClose,
                                       onSelect,
                                       selected,
                                       title = 'Selecione um ícone',
                                       columns = 20,
                                   }: IconPickerProps) {
    const [search, setSearch] = useState('');
    const [selectedClass, setSelectedClass] = useState<string | null>(selected ?? null);
    const [versao, setVersao] = useState<Icone['versao'] | 'todas'>('todas');

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return LISTA_ICONES.filter((icone) => {
            if (versao !== 'todas' && icone.versao !== versao) return false;
            if (!query) return true;
            const tokens = query.split(/\s+/);
            const haystack = `${icone.classe} ${icone.icon} ${icone.search ?? ''}`.toLowerCase();
            return tokens.every((token) => haystack.includes(token));
        });
    }, [search, versao]);

    if (!open) return null;

    const pick = (icone: Icone) => {
        setSelectedClass(icone.classe);
        onSelect(icone);
    };

    const gridStyle = {gridTemplateColumns: `repeat(${columns}, 1fr)`};

    return (
        <div className="icon-picker-overlay" onClick={onClose}>
            <div className="icon-picker" onClick={(event) => event.stopPropagation()}>
                <div className="icon-picker-header">
                    <span>{title}</span>
                    <button type="button" className="icon-picker-close" onClick={onClose} aria-label="Fechar">
                        ×
                    </button>
                </div>

                <div className="icon-picker-toolbar">
                    <input
                        type="text"
                        className="icon-picker-search"
                        placeholder="Buscar ícone (ex.: home, user, calendar, menu)..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        autoFocus
                    />
                    <span className="icon-picker-count">
            {filtered.length} {filtered.length === 1 ? 'ícone' : 'ícones'}
          </span>
                    <select
                        className="icon-picker-versao"
                        value={versao}
                        onChange={(event) => setVersao(event.target.value as Icone['versao'] | 'todas')}
                        aria-label="Filtrar por versão"
                    >
                        <option value="todas">Todas as versões</option>
                        <option value="4.x">Font Awesome 4.x</option>
                        <option value="5.x">Font Awesome 5.x</option>
                        <option value="6.x">Font Awesome 6.x</option>
                    </select>
                </div>

                <div className="icon-picker-grid" style={gridStyle}>
                    {filtered.map((icone) => {
                        const escopo = escopoPorClasse(icone.classe) ?? '';
                        return (
                            <button
                                key={`${icone.versao}-${icone.classe}`}
                                type="button"
                                className={`icon-picker-item ${icone.classe === selectedClass ? 'selected' : ''}`}
                                title={`${icone.icon} · Font Awesome ${icone.versao}`}
                                onClick={() => pick(icone)}
                            >
                                <span className="icon-picker-versao-badge">{icone.versao.slice(0, 1)}</span>
                                <span className={`icon-picker-glyph ${escopo} ${icone.classe}`} aria-hidden="true"/>
                            </button>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <p className="icon-picker-empty">Nenhum ícone encontrado para "{search}".</p>
                )}

                <div className="icon-picker-footer">
          <span className="icon-picker-preview">
            {selectedClass ? (
                <IconPreview classe={selectedClass}/>
            ) : (
                'Nenhum ícone selecionado'
            )}
          </span>
                    <button type="button" className="btn-primary" onClick={onClose}>
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}

export function IconPreview({classe}: { classe: string }) {
    const renderContent = (): ReactNode => {
        const escopo = escopoPorClasse(classe);
        if (escopo) {
            return <span className={`${escopo} ${classe}`} aria-hidden="true"/>;
        }
        if (classe.startsWith('ui-icon')) {
            return <span className={`ui-icon ${classe}`} aria-hidden="true"/>;
        }
        return <span>{classe}</span>;
    };

    return (
        <span className="icon-picker-preview-content">
      <span className="icon-picker-preview-glyph">{renderContent()}</span>
      <code>{classe}</code>
    </span>
    );
}
