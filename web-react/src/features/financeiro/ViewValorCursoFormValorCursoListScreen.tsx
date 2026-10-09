import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {PermissionGate} from '../../shared/services/permissions';
import {Tabs} from '../../shared/components/Tabs';
import {UnidadeCombo} from '../../shared/components/UnidadeCombo';
import type {AutoCompleteOption} from '../../shared/components/AutoComplete';
import {BooleanField} from '../../shared/components/BooleanField';
import type {ApiItem} from '../../shared/types/index';
import {api} from '../../shared/services/api';
import {
    CURSO_SOURCE,
} from '../../shared/services/masterDetailSources';

const VALOR_CURSO_API = '/api/financeiro/valor-curso';
const FORMA_PAGAMENTO_SOURCE = '/api/financeiro/forma-pagamento';
const DESCONTO_CURSO_SOURCE = '/api/view/descontoCurso/listDescontoCurso';
const TAXA_CURSO_SOURCE = '/api/view/taxaCurso/listTaxaCurso';

// ── helpers ──────────────────────────────────────────────────────────
const requiredMark = <span style={{color:'#C90000',marginLeft:4}}>*</span>;

const rec = (item: unknown): Record<string, unknown> =>
    (item && typeof item === 'object' ? item as Record<string, unknown> : {});

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

const toDateInput = (v: unknown): string => {
    if (v === null || v === undefined) return '';
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v));
    return m ? `${m[1]}-${m[2]}-${m[3]}` : '';
};

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

const descricaoLabel = (item: ApiItem): string => {
    const r = rec(item);
    const desc = str(r.descricao);
    return desc ? `${desc}${r.valor ? ` · ${formatValor(r.valor)}` : ''}` : `#${str(r.id)}`;
};

// ── multi-seleção simples (forma pagamento / descontos / taxas) ──────
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
export default function ViewValorCursoFormValorCursoListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idParam = searchParams.get('id');

    // ── form state (aba Valor Curso) ─────────────────────────────────
    const [f, setF] = useState<Record<string, string>>({
        data: '', curriculoId: '', valor: '', juros: '', multa: '', descontoCarne: '',
        valorDescontoAluno: '', diasSpc: '', diasToleranciaMulta: '',
        percDescJurMul: '', percDescValor: '', percValorMinEntrada: '',
        prazoParcEntrada: '', prazoParcSegunda: '', qtdeParcelas: '',
    });
    const upd = (k: string, v: string) => setF((p) => ({...p, [k]: v}));
    const [valorHora, setValorHora] = useState(false);
    const [cobraRematricula, setCobraRematricula] = useState(false);

    // ── vínculos (abas) ──────────────────────────────────────────────
    const [unidade, setUnidade] = useState<AutoCompleteOption | null>(null);
    const [formaIds, setFormaIds] = useState<number[]>([]);
    const [descontoIds, setDescontoIds] = useState<number[]>([]);
    const [taxaIds, setTaxaIds] = useState<number[]>([]);

    const [salvando, setSalvando] = useState(false);
    const [error, setError] = useState<string | undefined>();

    // ── opções ───────────────────────────────────────────────────────
    const {data: curriculos = []} = useQuery({queryKey: [CURSO_SOURCE], queryFn: async () => (await api.get<ApiItem[]>(CURSO_SOURCE)).data ?? []});
    const {data: formas = []} = useQuery({queryKey: [FORMA_PAGAMENTO_SOURCE], queryFn: async () => (await api.get<ApiItem[]>(FORMA_PAGAMENTO_SOURCE)).data ?? []});
    const {data: descontos = []} = useQuery({queryKey: [DESCONTO_CURSO_SOURCE], queryFn: async () => (await api.get<ApiItem[]>(DESCONTO_CURSO_SOURCE)).data ?? []});
    const {data: taxas = []} = useQuery({queryKey: [TAXA_CURSO_SOURCE], queryFn: async () => (await api.get<ApiItem[]>(TAXA_CURSO_SOURCE)).data ?? []});

    // ── carregar edição ──────────────────────────────────────────────
    useEffect(() => {
        if (!idParam) return;
        let alive = true;
        (async () => {
            try {
                const row = rec((await api.get(`${VALOR_CURSO_API}/${idParam}`)).data);
                if (!alive) return;
                setF({
                    data: toDateInput(row.data),
                    curriculoId: row.curriculoId != null ? String(row.curriculoId) : '',
                    valor: str(row.valor ?? ''),
                    juros: str(row.juros ?? ''),
                    multa: str(row.multa ?? ''),
                    descontoCarne: str(row.descontoCarne ?? ''),
                    valorDescontoAluno: str(row.valorDescontoAluno ?? ''),
                    diasSpc: str(row.diasSpc ?? ''),
                    diasToleranciaMulta: str(row.diasToleranciaMulta ?? ''),
                    percDescJurMul: str(row.percDescJurMul ?? ''),
                    percDescValor: str(row.percDescValor ?? ''),
                    percValorMinEntrada: str(row.percValorMinEntrada ?? ''),
                    prazoParcEntrada: str(row.prazoParcEntrada ?? ''),
                    prazoParcSegunda: str(row.prazoParcSegunda ?? ''),
                    qtdeParcelas: str(row.qtdeParcelas ?? ''),
                });
                setValorHora(row.valorHora === true);
                setCobraRematricula(row.cobraRematricula === true);
                try {
                    const [u, fp, d, t] = await Promise.all([
                        api.get<number[]>(`${VALOR_CURSO_API}/${idParam}/unidades`),
                        api.get<number[]>(`${VALOR_CURSO_API}/${idParam}/formas-pagamento`),
                        api.get<number[]>(`${VALOR_CURSO_API}/${idParam}/descontos`),
                        api.get<number[]>(`${VALOR_CURSO_API}/${idParam}/taxas`),
                    ]);
                    if (!alive) return;
                    const uIds = new Set((u.data ?? []).map(Number));
                    setUnidade(uIds.size ? {id: [...uIds][0], label: ''} : null);
                    setFormaIds((fp.data ?? []).map(Number));
                    setDescontoIds((d.data ?? []).map(Number));
                    setTaxaIds((t.data ?? []).map(Number));
                } catch { /* vínculos opcionais */ }
            } catch (e) { console.error(e); setError('Erro ao carregar valor do curso.'); }
        })();
        return () => { alive = false; };
    }, [idParam]);

    const voltar = () => navigate('/view/valorCurso/listValorCurso');

    const salvar = async (voltarDepois: boolean) => {
        if (!f.curriculoId || !f.data) { setError('Informe Currículo e Data.'); return; }
        if (!valorHora && parseDecimal(f.valor) === null) { setError('Informe o Valor do curso (ou marque Valor por Hora).'); return; }
        setSalvando(true); setError(undefined);
        try {
            const body = {
                data: f.data || null,
                curriculoId: parseIntOrNull(f.curriculoId),
                valor: parseDecimal(f.valor),
                valorHora,
                juros: parseDecimal(f.juros),
                multa: parseDecimal(f.multa),
                descontoCarne: parseDecimal(f.descontoCarne),
                valorDescontoAluno: parseDecimal(f.valorDescontoAluno),
                diasSpc: parseIntOrNull(f.diasSpc),
                diasToleranciaMulta: parseIntOrNull(f.diasToleranciaMulta),
                percDescJurMul: parseDecimal(f.percDescJurMul),
                percDescValor: parseDecimal(f.percDescValor),
                percValorMinEntrada: parseDecimal(f.percValorMinEntrada),
                prazoParcEntrada: parseIntOrNull(f.prazoParcEntrada),
                prazoParcSegunda: parseIntOrNull(f.prazoParcSegunda),
                qtdeParcelas: parseDecimal(f.qtdeParcelas),
                cobraRematricula,
            };
            const res = idParam
                ? await api.put(`${VALOR_CURSO_API}/${idParam}`, body)
                : await api.post(VALOR_CURSO_API, body);
            const novoId = (res.data as Record<string, unknown>)?.id ?? (idParam ? Number(idParam) : undefined);
            if (novoId != null) {
                const vid = Number(novoId);
                await api.put(`${VALOR_CURSO_API}/${vid}/unidades`, unidade ? [unidade.id] : []);
                await api.put(`${VALOR_CURSO_API}/${vid}/formas-pagamento`, formaIds);
                await api.put(`${VALOR_CURSO_API}/${vid}/descontos`, descontoIds);
                await api.put(`${VALOR_CURSO_API}/${vid}/taxas`, taxaIds);
            }
            if (voltarDepois) voltar(); else alert('Registro salvo com sucesso.');
        } catch (e) { console.error(e); setError('Erro ao salvar registro.'); }
        finally { setSalvando(false); }
    };

    // ── tab contents ─────────────────────────────────────────────────
    const tabValorCurso = (
        <div className="form-grid">
            <label className="form-field"><span className="form-label">Currículo {requiredMark}</span>
                <select className="form-input form-select" value={f.curriculoId} onChange={(e) => upd('curriculoId', e.target.value)}>
                    <option value="">-- Selecione --</option>
                    {curriculos.map((c) => <option key={itemId(c)} value={String(itemId(c))}>{curriculoLabel(c)}</option>)}
                </select></label>
            <label className="form-field"><span className="form-label">Data {requiredMark}</span>
                <input className="form-input" type="date" value={f.data} onChange={(e) => upd('data', e.target.value)} /></label>

            <label className="form-field"><span className="form-label">Valor por Hora</span>
                <BooleanField value={valorHora} onChange={setValorHora} /></label>
            <label className="form-field"><span className="form-label">{valorHora ? 'Valor Hora' : 'Valor Curso'} {!valorHora && requiredMark}</span>
                <input className="form-input" inputMode="decimal" value={f.valor} onChange={(e) => upd('valor', e.target.value)} placeholder="0,00" /></label>

            <div style={{gridColumn: '1 / -1', borderTop: '1px solid #e6e6e6', marginTop: 8, paddingTop: 12, fontWeight: 700, fontSize: 13, color: '#2f333b'}}>Cobrança</div>
            <label className="form-field"><span className="form-label">Juros (%)</span>
                <input className="form-input" inputMode="decimal" value={f.juros} onChange={(e) => upd('juros', e.target.value)} placeholder="0,00" /></label>
            <label className="form-field"><span className="form-label">Multa (%)</span>
                <input className="form-input" inputMode="decimal" value={f.multa} onChange={(e) => upd('multa', e.target.value)} placeholder="0,00" /></label>
            <label className="form-field"><span className="form-label">Desconto Carnê</span>
                <input className="form-input" inputMode="decimal" value={f.descontoCarne} onChange={(e) => upd('descontoCarne', e.target.value)} placeholder="0,00" /></label>
            <label className="form-field"><span className="form-label">Valor Desconto Aluno</span>
                <input className="form-input" inputMode="decimal" value={f.valorDescontoAluno} onChange={(e) => upd('valorDescontoAluno', e.target.value)} placeholder="0,00" /></label>
            <label className="form-field"><span className="form-label">Dias SPC</span>
                <input className="form-input" inputMode="numeric" value={f.diasSpc} onChange={(e) => upd('diasSpc', e.target.value)} placeholder="0" /></label>
            <label className="form-field"><span className="form-label">Dias Tolerância Multa</span>
                <input className="form-input" inputMode="numeric" value={f.diasToleranciaMulta} onChange={(e) => upd('diasToleranciaMulta', e.target.value)} placeholder="0" /></label>
            <label className="form-field"><span className="form-label">Cobra Rematrícula</span>
                <BooleanField value={cobraRematricula} onChange={setCobraRematricula} /></label>

            <div style={{gridColumn: '1 / -1', borderTop: '1px solid #e6e6e6', marginTop: 8, paddingTop: 12, fontWeight: 700, fontSize: 13, color: '#2f333b'}}>Parcelamento</div>
            <label className="form-field"><span className="form-label">% Desc. Juros/Multa</span>
                <input className="form-input" inputMode="decimal" value={f.percDescJurMul} onChange={(e) => upd('percDescJurMul', e.target.value)} placeholder="0,00" /></label>
            <label className="form-field"><span className="form-label">% Desc. Valor</span>
                <input className="form-input" inputMode="decimal" value={f.percDescValor} onChange={(e) => upd('percDescValor', e.target.value)} placeholder="0,00" /></label>
            <label className="form-field"><span className="form-label">% Valor Mín. Entrada</span>
                <input className="form-input" inputMode="decimal" value={f.percValorMinEntrada} onChange={(e) => upd('percValorMinEntrada', e.target.value)} placeholder="0,00" /></label>
            <label className="form-field"><span className="form-label">Prazo Parc. Entrada</span>
                <input className="form-input" inputMode="numeric" value={f.prazoParcEntrada} onChange={(e) => upd('prazoParcEntrada', e.target.value)} placeholder="0" /></label>
            <label className="form-field"><span className="form-label">Prazo Parc. Segunda</span>
                <input className="form-input" inputMode="numeric" value={f.prazoParcSegunda} onChange={(e) => upd('prazoParcSegunda', e.target.value)} placeholder="0" /></label>
            <label className="form-field"><span className="form-label">Qtde Parcelas</span>
                <input className="form-input" inputMode="decimal" value={f.qtdeParcelas} onChange={(e) => upd('qtdeParcelas', e.target.value)} placeholder="0" /></label>
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
                            <div className="breadcrumb-group"><span className="breadcrumb-item breadcrumb-current">Valor Curso — Cadastro</span></div>
                        </nav>
                    </div>
                </div>

                {error && <div className="form-erro" style={{maxWidth: 980, margin: '12px auto', background: '#fff0f0', border: '1px solid #f5c6cb', color: '#a61b29', padding: '10px 14px', borderRadius: 6}}>{error}</div>}

                <div style={{maxWidth: 980, margin: '0 auto', padding: '0 16px 24px'}}>
                    <div className="div_form" style={{padding: 16}}>
                        <Tabs tabs={[
                            {key: 'valorCurso', label: 'Valor Curso', content: tabValorCurso},
                            {key: 'unidade', label: 'Unidade', content: tabUnidade},
                            {
                                key: 'formaPagamento', label: 'Forma Pagamento',
                                content: <LinkPicker label="Formas de Pagamento" options={formas} selectedIds={formaIds} onChange={setFormaIds} optionLabel={formaPagamentoLabel} />,
                            },
                            {
                                key: 'descontos', label: 'Descontos',
                                content: <LinkPicker label="Descontos" options={descontos} selectedIds={descontoIds} onChange={setDescontoIds} optionLabel={descricaoLabel} />,
                            },
                            {
                                key: 'taxas', label: 'Taxas',
                                content: <LinkPicker label="Taxas" options={taxas} selectedIds={taxaIds} onChange={setTaxaIds} optionLabel={descricaoLabel} />,
                            },
                        ]} initial="valorCurso" />
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
