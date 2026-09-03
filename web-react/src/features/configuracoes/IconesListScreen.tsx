import {useMemo, useState} from 'react';
import {PermissionGate} from '../../shared/services/permissions';
import {LISTA_ICONES, escopoPorClasse, type Icone} from '../../shared/utils/icones';
import IconPicker, {IconPreview} from '../../shared/components/IconPicker';
import './IconesListScreen.css';

export default function IconesListScreen() {
    const [search, setSearch] = useState('');
    const [versao, setVersao] = useState<Icone['versao'] | 'todas'>('todas');
    const [selected, setSelected] = useState<Icone | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

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

    const copyIcon = async (icone: Icone) => {
        setSelected(icone);
        try {
            await navigator.clipboard.writeText(icone.icon);
            setCopied(icone.icon);
            window.setTimeout(() => setCopied((current) => (current === icone.icon ? null : current)), 1500);
        } catch {
            setCopied(null);
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <div className="icones-screen">
                    <div className="div_form">
                        <div className="form-title">Ícones Disponíveis</div>

                        <div className="icones-toolbar">
                            <input
                                type="text"
                                className="icones-search"
                                placeholder="Buscar ícone (ex.: home, user, menu, calendar)..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                            <span className="icones-count">
                {filtered.length} {filtered.length === 1 ? 'ícone' : 'ícones'}
              </span>
                            <select
                                className="icones-versao"
                                value={versao}
                                onChange={(event) => setVersao(event.target.value as Icone['versao'] | 'todas')}
                                aria-label="Filtrar por versão"
                            >
                                <option value="todas">Todas as versões</option>
                                <option value="4.x">Font Awesome 4.x</option>
                                <option value="5.x">Font Awesome 5.x</option>
                                <option value="6.x">Font Awesome 6.x</option>
                            </select>
                            <button type="button" className="btn-primary" onClick={() => setPickerOpen(true)}>
                                Abrir seletor
                            </button>
                        </div>

                        {selected && (
                            <div className="icones-selected">
                                <span className="icones-selected-label">Ícone selecionado:</span>
                                <IconPreview classe={selected.classe}/>
                                {copied === selected.icon && <span className="icones-copied">Copiado!</span>}
                            </div>
                        )}

                        <div className="icones-grid">
                            {filtered.map((icone) => {
                                const escopo = escopoPorClasse(icone.classe) ?? '';
                                return (
                                    <button
                                        key={`${icone.versao}-${icone.classe}`}
                                        type="button"
                                        className={`icones-item ${selected?.classe === icone.classe ? 'selected' : ''}`}
                                        title={`${icone.icon} · Font Awesome ${icone.versao}`}
                                        onClick={() => copyIcon(icone)}
                                    >
                                        <span className="icones-versao-badge">{icone.versao.slice(0, 1)}</span>
                                        <span className={`icones-glyph ${escopo} ${icone.classe}`} aria-hidden="true"/>
                                        <code className="icones-code">{icone.icon}</code>
                                    </button>
                                );
                            })}
                        </div>

                        {filtered.length === 0 && (
                            <p className="icones-empty">Nenhum ícone encontrado para "{search}".</p>
                        )}
                    </div>
                </div>

                <IconPicker
                    open={pickerOpen}
                    onClose={() => setPickerOpen(false)}
                    onSelect={(icone) => {
                        setSelected(icone);
                        setPickerOpen(false);
                    }}
                    selected={selected?.classe}
                />
            </main>
        </PermissionGate>
    );
}
