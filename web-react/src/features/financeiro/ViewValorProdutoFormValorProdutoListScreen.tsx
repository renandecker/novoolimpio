import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {PermissionGate} from '../../shared/services/permissions';
import {Tabs} from '../../shared/components/Tabs';
import {UnidadeCombo} from '../../shared/components/UnidadeCombo';
import type {AutoCompleteOption} from '../../shared/components/AutoComplete';
import type {ApiItem} from '../../shared/types/index';
import {api} from '../../shared/services/api';
import {CURSO_SOURCE} from '../../shared/services/masterDetailSources';

const VALOR_PRODUTO_API = '/api/financeiro/valor-produto';
const FORMA_PAGAMENTO_SOURCE = '/api/financeiro/forma-pagamento';

// ── helpers ──────────────────────────────────────────────────────────
const requiredMark = <span style={{color:'#C90000',marginLeft:4}}>*</span>;

const rec = (item: unknown): Record<string, unknown> =>
    (item && typeof item === 'object' ? item as Record<string, unknown> : {});

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

/** "1.234,56" | "1234.56" -> number | null */
const parseDecimal = (v: string): number | null => {
    const clean = v.trim();
    if (!clean) return null;
    const normalized = clean.includes(',') ? clean.replace(/\./g, '').replace(',', '.') : clean;
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
};

const parseIntOrNull = (v: string): number | null => {
    const clean = v.trim();
    if (!clean) return null;
    const n = Number(clean);
    return Number.isInteger(n) ? n : null;
};

const formatValor = (v: unknown): string => {
    if (v === null || v === undefined || v === '') return '';
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v);
    return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(n);
};

const itemId = (item: ApiItem): number => Number((item as unknown as Record<string, any>).id);

const curriculoLabel = (item: ApiItem): string => {
    const r = rec(item);
    return str(r.id_curso_descricao ?? r.curso_descricao ?? r.curso ?? r.descricao ?? r.sucinto ?? r.sigla ?? `#${str(r.id)}`);
};

const formaPagamentoLabel = (item: ApiItem): string => {
    const r = rec(item);
    const vezes = str(r.vezes ?? r.qtd_vezes ?? r.qtdVezes);
    const juros = r.juros ?? r.desconto;
    return `#${str(r.id)} · ${vezes || '?'}x${juros ? ` · ${formatValor(juros)}` : ''}`;
};

// ── multi-seleção simples (cursos / formas pagamento) ────────────────
function LinkPicker({label, options, selectedIds, onChange, optionLabel}: {
    label: string;
    options: ApiItem[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
    optionLabel: (item: ApiItem) => string;
}) {
    const [pick, setPick] = useState('');
    const selectedSet = new Set(selectedIds);
    const selectedItems = options.filter((o) => selectedSet.has(itemId(o)));
    const available = options.filter((o) => !selectedSet.has(itemId(o)));
    return (
        <div className="form-grid">
            <label className="form-field" style={{gridColumn: '1 / -1'}}>
                <span className="form-label">{label}</span>
                <div style={{display: 'flex', gap: 8, width: '100%'}}>
                    <select className="form-input form-select" value={pick} onChange={(e) => setPick(e.target.value)} style={{flex: 1}}>
                        <option value="">-- Selecione --</option>
                        {available.map((o) => <option key={itemId(o)} value={String(itemId(o))}>{optionLabel(o)}</option>)}
                    </select>
                    <button type="button" className="btnyellow" disabled={!pick} onClick={() => {
                        if (pick) { onChange([...selectedIds, Number(pick)]); setPick(''); }
                    }}>Adicionar</button>
                </div>
            </label>
            <div style={{gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 8}}>
                {selectedItems.length === 0
                    ? <div style={{color: '#888', fontSize: 12, fontStyle: 'italic'}}>Nenhum vínculo selecionado.</div>
                    : selectedItems.map((o) => (
                        <div key={itemId(o)} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, border: '1px solid #e0e0e0', borderRadius: 6, padding: '8px 12px', background: '#fafafa'}}>
                            <span style={{fontSize: 13}}>{optionLabel(o)}</span>
                            <button type="button" className="btnstop" style={{backgroundColor: '#e53935', borderColor: '#e53935', color: '#fff'}} onClick={() => onChange(selectedIds.filter((id) => id !== itemId(o)))}>Remover</button>
                        </div>
                    ))}
            </div>
        </div>
    );
}

// ── Componente principal ─────────────────────────────────────────────
export default function ViewValorProdutoFormValorProdutoListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idParam = searchParams.get('id');

    // ── form state (aba Valor Produto) ─────────────────────────────────
    const [f, setF] = useState<Record<string, string>>({
        vezes: '', juros: '', desconto: '', multa: '', diasSpc: '', diasToleranciaMulta: '',
    });
    const upd = (k: string, v: string) => setF((p) => ({...p, [k]: v}));

    // ── vínculos (abas) ──────────────────────────────────────────────
    const [unidade, setUnidade] = useState<AutoCompleteOption | null>(null);
    const [cursoIds, setCursoIds] = useState<number[]>([]);
    const [formaIds, setFormaIds] = useState<number[]>([]);

    const [salvando, setSalvando] = useState(false);
    const [error, setError] = useState<string | undefined>();

    // ── opções ───────────────────────────────────────────────────────
    const {data: curriculos = []} = useQuery({queryKey: [CURSO_SOURCE], queryFn: async () => (await api.get<ApiItem[]>(CURSO_SOURCE)).data ?? []});
    const {data: formas = []} = useQuery({queryKey: [FORMA_PAGAMENTO_SOURCE], queryFn: async () => (await api.get<ApiItem[]>(FORMA_PAGAMENTO_SOURCE)).data ?? []});

    // Cursos da unidade selecionada (edc_curriculo_unidade). Quando há unidade,
    // restringe as opções aos currículos vinculados a ela.
    const {data: cursosDaUnidade} = useQuery({
        queryKey: ['cursos-da-unidade', unidade?.id],
        queryFn: async () => (await api.get<number[]>('/api/educacao/curriculo/buscar-cursos-da-unidade', {params: {unidadeId: unidade!.id}})).data ?? [],
        enabled: !!unidade?.id,
    });

    const cursosFiltrados = (() => {
        if (!unidade?.id || !cursosDaUnidade) return curriculos;
        const set = new Set((cursosDaUnidade ?? []).map(Number));
        return curriculos.filter((c) => set.has(itemId(c)));
    })();

    // ── carregar edição ──────────────────────────────────────────────
    useEffect(() => {
        if (!idParam) return;
        let alive = true;
        (async () => {
            try {
                const row = rec((await api.get(`${VALOR_PRODUTO_API}/${idParam}`)).data);
                if (!alive) return;
                setF({
                    vezes: row.vezes != null ? String(row.vezes) : '',
                    juros: str(row.juros ?? ''),
                    desconto: str(row.desconto ?? ''),
                    multa: str(row.multa ?? ''),
                    diasSpc: row.diasSpc != null ? String(row.diasSpc) : '',
                    diasToleranciaMulta: row.diasToleranciaMulta != null ? String(row.diasToleranciaMulta) : '',
                });
                try {
                    const [u, c, fp] = await Promise.all([
                        api.get<number[]>(`${VALOR_PRODUTO_API}/${idParam}/unidades`),
                        api.get<number[]>(`${VALOR_PRODUTO_API}/${idParam}/cursos`),
                        api.get<number[]>(`${VALOR_PRODUTO_API}/${idParam}/formas-pagamento`),
                    ]);
                    if (!alive) return;
                    const uIds = (u.data ?? []).map(Number);
                    setUnidade(uIds.length ? {id: uIds[0], label: ''} : null);
                    setCursoIds((c.data ?? []).map(Number));
                    setFormaIds((fp.data ?? []).map(Number));
                } catch { /* vínculos opcionais */ }
            } catch (e) { console.error(e); setError('Erro ao carregar valor do produto.'); }
        })();
        return () => { alive = false; };
    }, [idParam]);

    const voltar = () => navigate('/view/valorProduto/listValorProduto');

    const salvar = async (voltarDepois: boolean) => {
        if (parseIntOrNull(f.vezes) === null) { setError('Informe a quantidade de Vezes (maior que zero).'); return; }
        if ((parseIntOrNull(f.vezes) ?? 0) <= 0) { setError('Vezes deve ser maior que zero.'); return; }
        setSalvando(true); setError(undefined);
        try {
            const body = {
                vezes: parseIntOrNull(f.vezes) ?? 0,
                juros: parseDecimal(f.juros),
                desconto: parseDecimal(f.desconto),
                multa: parseDecimal(f.multa),
                diasSpc: parseIntOrNull(f.diasSpc) ?? 0,
                diasToleranciaMulta: parseIntOrNull(f.diasToleranciaMulta) ?? 0,
            };
            const res = idParam
                ? await api.put(`${VALOR_PRODUTO_API}/${idParam}`, body)
                : await api.post(VALOR_PRODUTO_API, body);
            const novoId = (res.data as Record<string, unknown>)?.id ?? (idParam ? Number(idParam) : undefined);
            if (novoId != null) {
                const vid = Number(novoId);
                await api.put(`${VALOR_PRODUTO_API}/${vid}/unidades`, unidade ? [unidade.id] : []);
                await api.put(`${VALOR_PRODUTO_API}/${vid}/cursos`, cursoIds);
                await api.put(`${VALOR_PRODUTO_API}/${vid}/formas-pagamento`, formaIds);
            }
            if (voltarDepois) voltar(); else alert('Registro salvo com sucesso.');
        } catch (e) { console.error(e); setError('Erro ao salvar registro.'); }
        finally { setSalvando(false); }
    };

    // ── tab contents ─────────────────────────────────────────────────
    const tabValorProduto = (
        <div className="form-grid">
            <label className="form-field"><span className="form-label">Vezes {requiredMark}</span>
                <input className="form-input" inputMode="numeric" value={f.vezes} onChange={(e) => upd('vezes', e.target.value)} placeholder="0" /></label>
            <label className="form-field"><span className="form-label">Desconto Carnê</span>
                <input className="form-input" inputMode="decimal" value={f.desconto} onChange={(e) => upd('desconto', e.target.value)} placeholder="0,00" /></label>
            <label className="form-field"><span className="form-label">Juros Carnê</span>
                <input className="form-input" inputMode="decimal" value={f.juros} onChange={(e) => upd('juros', e.target.value)} placeholder="0,00" /></label>
            <label className="form-field"><span className="form-label">Multa Carnê</span>
                <input className="form-input" inputMode="decimal" value={f.multa} onChange={(e) => upd('multa', e.target.value)} placeholder="0,00" /></label>
            <label className="form-field"><span className="form-label">Dias SPC (dias atraso)</span>
                <input className="form-input" inputMode="numeric" value={f.diasSpc} onChange={(e) => upd('diasSpc', e.target.value)} placeholder="0" /></label>
            <label className="form-field"><span className="form-label">Dias Tolerância Multa</span>
                <input className="form-input" inputMode="numeric" value={f.diasToleranciaMulta} onChange={(e) => upd('diasToleranciaMulta', e.target.value)} placeholder="0" /></label>
        </div>
    );

    const tabUnidade = (
        <div className="form-grid">
            <div style={{gridColumn: '1 / -1'}}>
                <UnidadeCombo
                    id="unidade"
                    label="Unidade"
                    value={unidade}
                    onChange={setUnidade}
                    minChars={2}
                />
            </div>
        </div>
    );

    return (
        <PermissionGate permission="READ">
            <main>
                <div className="page-header">
                    <div className="page-header-breadcrumb">
                        <nav className="breadcrumb" aria-label="Breadcrumb">
                            <div className="breadcrumb-group"><span className="breadcrumb-item breadcrumb-current">Valor Produto — Cadastro</span></div>
                        </nav>
                    </div>
                </div>

                {error && <div className="form-erro" style={{maxWidth: 980, margin: '12px auto', background: '#fff0f0', border: '1px solid #f5c6cb', color: '#a61b29', padding: '10px 14px', borderRadius: 6}}>{error}</div>}

                <div style={{maxWidth: 980, margin: '0 auto', padding: '0 16px 24px'}}>
                    <div className="div_form" style={{padding: 16}}>
                        <Tabs tabs={[
                            {key: 'valorProduto', label: 'Valor Produto', content: tabValorProduto},
                            {key: 'unidade', label: 'Unidade', content: tabUnidade},
                            {
                                key: 'curso', label: 'Curso',
                                content: (
                                    <div>
                                        {!unidade && <div style={{color: '#888', fontSize: 12, marginBottom: 8}}>Selecione a unidade para filtrar os cursos da unidade (edc_curriculo_unidade).</div>}
                                        <LinkPicker label="Cursos da Unidade" options={cursosFiltrados} selectedIds={cursoIds} onChange={setCursoIds} optionLabel={curriculoLabel} />
                                    </div>
                                ),
                            },
                            {
                                key: 'formaPagamento', label: 'Forma Pagamento',
                                content: <LinkPicker label="Formas de Pagamento (fin_valor_produto_forma_pagamento)" options={formas} selectedIds={formaIds} onChange={setFormaIds} optionLabel={formaPagamentoLabel} />,
                            },
                        ]} initial="valorProduto" />
                    </div>

                    <div className="form-buttons" style={{display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16}}>
                        <button type="button" className="btnyellow" onClick={voltar} disabled={salvando}>Voltar</button>
                        <button type="button" className="btnblue" onClick={() => void salvar(false)} disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar e Continuar'}</button>
                        <button type="button" className="btnstop" onClick={() => void salvar(true)} disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</button>
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}
