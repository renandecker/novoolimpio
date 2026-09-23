import {useState, useEffect} from 'react';
import {useSearchParams, useNavigate} from 'react-router-dom';

import {PermissionGate} from '../../../shared/services/permissions';
import {Wizard, useWizardData} from '../../../shared/components/Wizard';
import {Tabs} from '../../../shared/components/Tabs';
import {BooleanField} from '../../../shared/components/BooleanField';
import {useApi, api} from '../../../shared/services/api';
import {API_PATHS} from '../../../shared/services/apiPaths';

/* Formatações de nome de coluna (transientes, espelham estruturaController.formatoTexto/simboloTexto) */
const FORMATOS_TEXTO = [
    {value: 0, label: 'Normal'},
    {value: 1, label: 'Maiúsculo'},
    {value: 2, label: 'Minúsculo'},
    {value: 3, label: 'Capitalizar'},
];

const TIPOS_MEDIDA = [
    {value: 'PERCENTUAL', label: 'P (%)', className: 'btnblue', title: 'Virar percentual'},
    {value: 'MOEDA', label: 'M (R$)', className: 'btnred', title: 'Virar moeda'},
    {value: 'NUMERO', label: 'N (0,0)', className: 'btnyellow', title: 'Virar número'},
    {value: 'CONTAGEM', label: 'C', className: 'btnblack', title: 'Virar contagem'},
    {value: 'CONTAGEM-DISTINTA', label: 'CD', className: 'btngreen', title: 'Virar contagem distinta'},
];

const PAGINACAO_SQL = 'limit <<quantidade exibir>> offset <<página>>';

const QUEBRA_COLUNA = '<<quebra_coluna>>';

interface ColunaItem {
    id?: number;
    coluna: string;
    estruturaId?: number;
    _k?: number;
    _pending?: boolean;
    _dirtyColuna?: boolean;
}

interface DimItem {
    id?: number;
    tipo?: string;
    tipoInfo: string;
    nomeVisualizacao: string;
    estruturaColunaId?: number;
    estruturaId?: number;
    _k?: number;
    _colunaK?: number;
    _coluna?: string;
    _pending?: boolean;
    _dirty?: boolean;
}

interface MedidaItem extends DimItem {}

interface GeoItem {
    id?: number;
    nomeVisualizacao: string;
    estruturaColunaId?: number;
    estruturaId?: number;
    _k?: number;
    _colunaK?: number;
    _coluna?: string;
    _pending?: boolean;
    _dirty?: boolean;
}

const styles = {
    table: {
        width: '100%',
        borderCollapse: 'collapse' as const,
        fontSize: '13px',
    },
    th: {
        textAlign: 'left' as const,
        padding: '8px',
        borderBottom: '2px solid #ddd',
        background: '#f6f6f6',
        fontWeight: 600,
    },
    td: {padding: '6px 8px', borderBottom: '1px solid #eee'},
    empty: {padding: '12px', textAlign: 'center' as const, color: '#888'},
    rowAdd: {display: 'flex', gap: '8px', flexWrap: 'wrap' as const, alignItems: 'center', marginBottom: '12px'},
};

interface EstruturaFormData {
    entity: {
        id?: number;
        nome?: string;
        tabela?: string;
        condicao?: string;
        nomeBanco?: string;
        coordenada?: string;
        zoom?: string;
        configuracaoEmailId?: number;
    };
    definicoes: {formatoTexto: number; simboloTexto: boolean};
    colunas: ColunaItem[];
    dimensoes: DimItem[];
    dimensoesTempo: DimItem[];
    medidas: MedidaItem[];
    georeferencias: GeoItem[];
}

let seq = 0;

export default function ViewEstruturaFormEstruturaListScreen() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const editingId = searchParams.get('id') ? Number(searchParams.get('id')) : undefined;

    const {data, updateFields} = useWizardData<EstruturaFormData>({
        entity: {},
        definicoes: {formatoTexto: 0, simboloTexto: true},
        colunas: [],
        dimensoes: [],
        dimensoesTempo: [],
        medidas: [],
        georeferencias: [],
    });

    const [colunas, setColunas] = useState<ColunaItem[]>([]);
    const [dimensoes, setDimensoes] = useState<DimItem[]>([]);
    const [dimensoesTempo, setDimensoesTempo] = useState<DimItem[]>([]);
    const [medidas, setMedidas] = useState<MedidaItem[]>([]);
    const [georeferencias, setGeoreferencias] = useState<GeoItem[]>([]);
    const [configuracoesEmail, setConfiguracoesEmail] = useState<Array<{id: number; username: string}>>([]);

    // Texto das colunas do SQL (aba "Colunas" do passo SQL)
    const [novaColunaSql, setNovaColunaSql] = useState('');

    // Forms de adição dos painéis do passo Campos
    const [dimForm, setDimForm] = useState<{nomeVisualizacao: string; colunaK: number | undefined}>({nomeVisualizacao: '', colunaK: undefined});
    const [tempoForm, setTempoForm] = useState<{nomeVisualizacao: string; colunaK: number | undefined}>({nomeVisualizacao: '', colunaK: undefined});
    const [medForm, setMedForm] = useState<{nomeVisualizacao: string; tipoInfo: string; colunaK: number | undefined}>({nomeVisualizacao: '', tipoInfo: 'PERCENTUAL', colunaK: undefined});
    const [geoForm, setGeoForm] = useState<{nomeVisualizacao: string; colunaK: number | undefined}>({nomeVisualizacao: '', colunaK: undefined});

    const {post: saveEstrutura} = useApi(API_PATHS.relatorios.estrutura);
    const {put: updateEstrutura} = useApi(API_PATHS.relatorios.estrutura);
    const {get: loadColunas} = useApi(API_PATHS.relatorios.estruturaColuna);
    const {get: loadDimensoes} = useApi(API_PATHS.relatorios.dimensao);
    const {get: loadMedidas} = useApi(API_PATHS.relatorios.medida);
    const {get: loadGeoreferencias} = useApi(API_PATHS.relatorios.georeferencia);
    const {post: createColuna} = useApi(API_PATHS.relatorios.estruturaColuna);
    const {put: updateColuna} = useApi(API_PATHS.relatorios.estruturaColuna);
    const {delete: deleteColuna} = useApi(API_PATHS.relatorios.estruturaColuna);
    const {post: createDimensao} = useApi(API_PATHS.relatorios.dimensao);
    const {put: updateDimensao} = useApi(API_PATHS.relatorios.dimensao);
    const {delete: deleteDimensao} = useApi(API_PATHS.relatorios.dimensao);
    const {post: createMedida} = useApi(API_PATHS.relatorios.medida);
    const {put: updateMedida} = useApi(API_PATHS.relatorios.medida);
    const {delete: deleteMedida} = useApi(API_PATHS.relatorios.medida);
    const {post: createGeoreferencia} = useApi(API_PATHS.relatorios.georeferencia);
    const {put: updateGeoreferencia} = useApi(API_PATHS.relatorios.georeferencia);
    const {delete: deleteGeoreferencia} = useApi(API_PATHS.relatorios.georeferencia);

    // Token (configuração de e-mail) — espelha o autoComplete da referência
    useEffect(() => {
        api.get<Array<{id: number; username: string}>>('/api/basico/configuracao-email')
            .then((res) => setConfiguracoesEmail(Array.isArray(res.data) ? res.data : []))
            .catch((err) => console.error('Erro ao carregar configurações de e-mail:', err));
    }, []);

    useEffect(() => {
        updateFields({colunas, dimensoes, dimensoesTempo, medidas, georeferencias});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [colunas, dimensoes, dimensoesTempo, medidas, georeferencias]);

    useEffect(() => {
        if (editingId) {
            api.get<any>(`${API_PATHS.relatorios.estrutura}/${editingId}`)
                .then(async (res) => {
                    const estrutura = res.data ?? {};
                    updateFields({entity: {...data.entity, ...estrutura}});

                    const [colsRes, dimsRes, medsRes, geosRes] = await Promise.allSettled([
                        loadColunas(),
                        loadDimensoes(),
                        loadMedidas(),
                        loadGeoreferencias(),
                    ]);

                    const cols = colsRes.status === 'fulfilled' ? colsRes.value : [];
                    const dims = dimsRes.status === 'fulfilled' ? dimsRes.value : [];
                    const meds = medsRes.status === 'fulfilled' ? medsRes.value : [];
                    const geos = geosRes.status === 'fulfilled' ? geosRes.value : [];

                    if (colsRes.status === 'rejected') console.error('Erro ao carregar colunas:', colsRes.reason);
                    if (dimsRes.status === 'rejected') console.error('Erro ao carregar dimensões:', dimsRes.reason);
                    if (medsRes.status === 'rejected') console.error('Erro ao carregar medidas:', medsRes.reason);
                    if (geosRes.status === 'rejected') console.error('Erro ao carregar georeferências:', geosRes.reason);

                    const colsDaEstrutura: ColunaItem[] = (cols ?? []).filter((c: any) => c.estruturaId === editingId);
                    setColunas(colsDaEstrutura);

                    const colunaPara = (colunaId?: number) =>
                        colsDaEstrutura.find((c) => c.id === colunaId)?.coluna ?? '';

                    const dimsDaEstrutura: DimItem[] = (dims ?? [])
                        .filter((d: any) => d.estruturaId === editingId)
                        .map((d: any) => ({...d, _coluna: colunaPara(d.estruturaColunaId)}));
                    setDimensoes(dimsDaEstrutura.filter((d) => d.tipoInfo === 'DESCRITIVO'));
                    setDimensoesTempo(dimsDaEstrutura.filter((d) => d.tipoInfo === 'TEMPO'));
                    setMedidas((meds ?? []).filter((m: any) => m.estruturaId === editingId));

                    const geosDaEstrutura: GeoItem[] = (geos ?? [])
                        .filter((g: any) => g.estruturaId === editingId)
                        .map((g: any) => ({...g, _coluna: colunaPara(g.estruturaColunaId)}));
                    setGeoreferencias(geosDaEstrutura);
                })
                .catch((error) => console.error('Erro ao carregar estrutura:', error));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingId]);

    /* ── SQL: aba Colunas (Adicionar lista com quebra <<quebra_coluna>>) ─────────── */
    const addColunasLista = () => {
        const texto = novaColunaSql;
        if (!texto || !texto.trim()) return;
        let entradas: string[] = [];
        if (!texto.includes(QUEBRA_COLUNA)) {
            entradas = [texto.trim()];
        } else {
            entradas = texto.split(QUEBRA_COLUNA).map((col) => col.trim().replace(/,$/, ''));
        }
        const novas: ColunaItem[] = [...colunas];
        for (const col of entradas) {
            if (!col) continue;
            if (novas.some((c) => c.coluna === col)) continue; // "Coluna já existe!"
            novas.push({coluna: col, _k: seq++, _pending: true});
        }
        setColunas(novas);
        setNovaColunaSql('');
    };

    const updateColunaItem = (item: ColunaItem, valor: string) => {
        const proximas = colunas.map((c) => (c === item ? {...c, coluna: valor, _dirtyColuna: c.id ? true : c._dirtyColuna} : c));
        setColunas(proximas);
    };

    const removeColuna = async (item: ColunaItem) => {
        // Remove dependentes (espelha removeColunaAll/removeColuna do controller)
        const dependentesDelete = async () => {
            const ref = item.id;
            if (ref !== undefined) {
                for (const d of [...dimensoes, ...dimensoesTempo]) {
                    if (d.estruturaColunaId === ref) {
                        if (d.id) { try { await deleteDimensao(d.id); } catch (e) { console.error(e); } }
                    }
                }
                for (const m of medidas) {
                    if (m.estruturaColunaId === ref) {
                        if (m.id) { try { await deleteMedida(m.id); } catch (e) { console.error(e); } }
                    }
                }
                for (const g of georeferencias) {
                    if (g.estruturaColunaId === ref) {
                        if (g.id) { try { await deleteGeoreferencia(g.id); } catch (e) { console.error(e); } }
                    }
                }
            }
        };
        if (item.id) {
            try {
                await dependentesDelete();
                await deleteColuna(item.id);
            } catch (e) { console.error('Erro ao remover coluna:', e); }
        }
        const refId = item.id;
        setColunas(colunas.filter((c) => c !== item));
        setDimensoes(dimensoes.filter((d) => d._colunaK !== item._k && d.estruturaColunaId !== refId));
        setDimensoesTempo(dimensoesTempo.filter((d) => d._colunaK !== item._k && d.estruturaColunaId !== refId));
        setMedidas(medidas.filter((m) => m._colunaK !== item._k && m.estruturaColunaId !== refId));
        setGeoreferencias(georeferencias.filter((g) => g._colunaK !== item._k && g.estruturaColunaId !== refId));
    };

    /* ── Campos: adicionar / remover / virar / tipo ─────────────────────────────── */
    const addItem = (
        lista: DimItem[],
        setLista: (items: DimItem[]) => void,
        form: {nomeVisualizacao: string; colunaK?: number},
        tipo: string,
        tipoInfo: string,
        resetForm: () => void,
    ) => {
        if (!form.nomeVisualizacao.trim()) return;
        const colunaAtual = colunas.find((c) => c._k === form.colunaK);
        setLista([...lista, {
            nomeVisualizacao: form.nomeVisualizacao.trim(),
            tipo,
            tipoInfo,
            _colunaK: form.colunaK,
            _coluna: colunaAtual?.coluna ?? '',
            _pending: true,
        }]);
        resetForm();
    };

    const addDimensao = () =>
        addItem(dimensoes, (items) => setDimensoes(items), dimForm, 'DIMENSAO', 'DESCRITIVO', () => setDimForm({nomeVisualizacao: '', colunaK: undefined}));

    const addDimensaoTempo = () =>
        addItem(dimensoesTempo, (items) => setDimensoesTempo(items), tempoForm, 'DIMENSAO', 'TEMPO', () => setTempoForm({nomeVisualizacao: '', colunaK: undefined}));

    const addMedida = () => {
        if (!medForm.nomeVisualizacao.trim()) return;
        const colunaAtual = colunas.find((c) => c._k === medForm.colunaK);
        setMedidas([...medidas, {
            nomeVisualizacao: medForm.nomeVisualizacao.trim(),
            tipo: 'MEDIDA',
            tipoInfo: medForm.tipoInfo,
            _colunaK: medForm.colunaK,
            _coluna: colunaAtual?.coluna ?? '',
            _pending: true,
        }]);
        setMedForm({nomeVisualizacao: '', tipoInfo: 'PERCENTUAL', colunaK: undefined});
    };

    const addGeoreferencia = () => {
        if (!geoForm.nomeVisualizacao.trim()) return;
        const colunaAtual = colunas.find((c) => c._k === geoForm.colunaK);
        setGeoreferencias([...georeferencias, {
            nomeVisualizacao: geoForm.nomeVisualizacao.trim(),
            _colunaK: geoForm.colunaK,
            _coluna: colunaAtual?.coluna ?? '',
            _pending: true,
        }]);
        setGeoForm({nomeVisualizacao: '', colunaK: undefined});
    };

    const updateDimNome = (item: DimItem, valor: string) => {
        const atualiza = (lista: DimItem[], setLista: (items: DimItem[]) => void) =>
            setLista(lista.map((d) => (d === item ? {...d, nomeVisualizacao: valor, _dirty: d.id ? true : d._dirty} : d)));
        if (dimensoes.includes(item)) atualiza(dimensoes, (items) => setDimensoes(items));
        else if (dimensoesTempo.includes(item)) atualiza(dimensoesTempo, (items) => setDimensoesTempo(items));
    };

    const updateGeoNome = (item: GeoItem, valor: string) => {
        setGeoreferencias(georeferencias.map((g) => (g === item ? {...g, nomeVisualizacao: valor, _dirty: g.id ? true : g._dirty} : g)));
    };

    const removeDimensao = async (item: DimItem) => {
        if (item.id) { try { await deleteDimensao(item.id); } catch (e) { console.error('Erro ao remover dimensão:', e); } }
        if (dimensoes.includes(item)) setDimensoes(dimensoes.filter((d) => d !== item));
        else setDimensoesTempo(dimensoesTempo.filter((d) => d !== item));
    };

    const removeMedida = async (item: MedidaItem) => {
        if (item.id) { try { await deleteMedida(item.id); } catch (e) { console.error('Erro ao remover medida:', e); } }
        setMedidas(medidas.filter((m) => m !== item));
    };

    const removeGeoreferencia = async (item: GeoItem) => {
        if (item.id) { try { await deleteGeoreferencia(item.id); } catch (e) { console.error('Erro ao remover georeferência:', e); } }
        setGeoreferencias(georeferencias.filter((g) => g !== item));
    };

    /** Virar Coordenada: Dimensão (descrição) → Georeferência */
    const virarCoordenada = async (item: DimItem) => {
        if (item.id) {
            try {
                await deleteDimensao(item.id);
                await createGeoreferencia({
                    nomeVisualizacao: item.nomeVisualizacao,
                    estruturaId: editingId,
                    estruturaColunaId: item.estruturaColunaId,
                });
            } catch (e) { console.error('Erro ao virar coordenada:', e); }
        }
        setDimensoes(dimensoes.filter((d) => d !== item));
        setGeoreferencias([...georeferencias, {...item, id: undefined, _pending: item._pending!}]);
    };

    /** Virar Descrição: Dimensão (tempo) → Dimensão (descritivo) */
    const virarDimensao = async (item: DimItem) => {
        if (item.id) {
            try {
                await deleteDimensao(item.id);
                await createDimensao({
                    nomeVisualizacao: item.nomeVisualizacao,
                    tipo: 'DIMENSAO',
                    tipoInfo: 'DESCRITIVO',
                    estruturaId: editingId,
                    estruturaColunaId: item.estruturaColunaId,
                });
            } catch (e) { console.error('Erro ao virar dimensão:', e); }
        }
        setDimensoesTempo(dimensoesTempo.filter((d) => d !== item));
        setDimensoes([...dimensoes, {...item, tipo: 'DIMENSAO', tipoInfo: 'DESCRITIVO', id: undefined}]);
    };

    /** Botões P/M/N/C/CD das medidas */
    const setTipoMedida = async (item: MedidaItem, tipoInfo: string) => {
        if (item.tipoInfo === tipoInfo) return;
        if (item.id) {
            try {
                await updateMedida(item.id, {
                    nomeVisualizacao: item.nomeVisualizacao,
                    tipo: 'MEDIDA',
                    tipoInfo,
                    estruturaId: item.estruturaId ?? editingId,
                    estruturaColunaId: item.estruturaColunaId,
                });
            } catch (e) { console.error('Erro ao alterar tipo da medida:', e); }
        }
        setMedidas(medidas.map((m) => (m === item ? {...m, tipoInfo} : m)));
    };

    const colunaSelect = (value: number | undefined, onChange: (k: number | undefined) => void) => (
        <select
            className="form-input form-select"
            style={{width: '220px'}}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        >
            <option value="">— Selecionar coluna —</option>
            {colunas.map((c) => (
                <option key={c._k ?? c.id} value={c._k ?? c.id}>{c.coluna}</option>
            ))}
        </select>
    );

    /* ── Salvamento ─────────────────────────────────────────────────────────────── */
    const salvar = async (formData: EstruturaFormData, continuar: boolean): Promise<number | undefined> => {
        const entity = formData.entity;
        const payload = {
            nome: entity.nome,
            tabela: entity.tabela,
            condicao: entity.condicao,
            nomeBanco: entity.nomeBanco,
            coordenada: entity.coordenada,
            zoom: entity.zoom,
            configuracaoEmailId: (entity.configuracaoEmailId || undefined) as number | undefined,
        };
        const savedId = editingId
            ? await updateEstrutura(editingId, payload).then((e: any) => e.id)
            : await saveEstrutura(payload).then((e: any) => e.id);

        // Colunas: cria pendentes e atualiza as que tiveram o texto alterado
        const colunaIdMap = new Map<number, number>();
        for (const c of formData.colunas) {
            if (c._pending) {
                const criada = await createColuna({coluna: c.coluna, estruturaId: savedId});
                if (c._k !== undefined) colunaIdMap.set(c._k, criada.id);
            } else if (c.id && c._dirtyColuna) {
                await updateColuna(c.id, {coluna: c.coluna, estruturaId: savedId});
            }
        }
        const resolveColunaId = (k?: number) => (k !== undefined ? colunaIdMap.get(k) : undefined);

        // Dimensões (descrição + tempo)
        for (const d of [...formData.dimensoes, ...formData.dimensoesTempo]) {
            const estruturaColunaId = resolveColunaId(d._colunaK) ?? d.estruturaColunaId;
            if (d._pending) {
                await createDimensao({
                    nomeVisualizacao: d.nomeVisualizacao,
                    tipo: 'DIMENSAO',
                    tipoInfo: d.tipoInfo,
                    estruturaId: savedId,
                    estruturaColunaId,
                });
            } else if (d.id && d._dirty) {
                await updateDimensao(d.id, {
                    nomeVisualizacao: d.nomeVisualizacao,
                    tipo: 'DIMENSAO',
                    tipoInfo: d.tipoInfo,
                    estruturaId: savedId,
                    estruturaColunaId,
                });
            }
        }
        for (const m of formData.medidas) {
            const estruturaColunaId = resolveColunaId(m._colunaK) ?? m.estruturaColunaId;
            if (m._pending) {
                await createMedida({
                    nomeVisualizacao: m.nomeVisualizacao,
                    tipo: 'MEDIDA',
                    tipoInfo: m.tipoInfo,
                    estruturaId: savedId,
                    estruturaColunaId,
                });
            } else if (m.id && m._dirty) {
                await updateMedida(m.id, {
                    nomeVisualizacao: m.nomeVisualizacao,
                    tipo: 'MEDIDA',
                    tipoInfo: m.tipoInfo,
                    estruturaId: savedId,
                    estruturaColunaId,
                });
            }
        }
        for (const g of formData.georeferencias) {
            const estruturaColunaId = resolveColunaId(g._colunaK) ?? g.estruturaColunaId;
            if (g._pending) {
                await createGeoreferencia({
                    nomeVisualizacao: g.nomeVisualizacao,
                    estruturaId: savedId,
                    estruturaColunaId,
                });
            } else if (g.id && g._dirty) {
                await updateGeoreferencia(g.id, {
                    nomeVisualizacao: g.nomeVisualizacao,
                    estruturaId: savedId,
                    estruturaColunaId,
                });
            }
        }
        return savedId;
    };

    const handleComplete = async (formData: EstruturaFormData) => {
        try {
            await salvar(formData, false);
            alert('Estrutura salva com sucesso!');
            navigate('/view/estrutura/listEstrutura');
        } catch (error) {
            console.error('Erro ao salvar estrutura:', error);
            alert('Erro ao salvar estrutura');
        }
    };

    const handleSalvarEContinuar = async () => {
        try {
            const savedId = await salvar(data, true);
            alert('Estrutura salva com sucesso!');
            if (savedId) navigate(`/view/estrutura/formEstrutura?id=${savedId}`);
        } catch (error) {
            console.error('Erro ao salvar estrutura:', error);
            alert('Erro ao salvar estrutura');
        }
    };

    /* ── Tabelas de edição (espelham os dataTables editáveis da referência) ─────── */

    const TabelaDim = ({lista, vira, virarTitulo}: {lista: DimItem[]; vira?: (item: DimItem) => void; virarTitulo?: string}) => (
        <table style={styles.table}>
            <thead>
            <tr>
                <th style={{...styles.th, width: '40%'}}>Coluna</th>
                <th style={{...styles.th, width: '30%'}}>Nome Visualização</th>
                <th style={{...styles.th, width: '15%'}}>Tipo</th>
                <th style={{...styles.th, width: '15%'}}>Remover</th>
            </tr>
            </thead>
            <tbody>
            {lista.length === 0 ? (
                <tr><td colSpan={4} style={styles.empty}>Nenhum registro encontrado.</td></tr>
            ) : lista.map((d) => (
                <tr key={d.id ?? d._k ?? `${d.nomeVisualizacao}-${d._coluna}`}>
                    <td style={styles.td}>{d._coluna ?? '—'}</td>
                    <td style={styles.td}>
                        <input
                            className="form-input"
                            value={d.nomeVisualizacao}
                            onChange={(e) => updateDimNome(d, e.target.value)}
                        />
                    </td>
                    <td style={styles.td}>
                        {vira && (
                            <button type="button" className="btnblue" title={virarTitulo} onClick={() => vira(d)}>
                                {virarTitulo}
                            </button>
                        )}
                    </td>
                    <td style={styles.td}>
                        <button type="button" className="btnred" onClick={() => removeDimensao(d)}>Remover</button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );

    const TabelaMedidas = () => (
        <table style={styles.table}>
            <thead>
            <tr>
                <th style={{...styles.th, width: '35%'}}>Coluna</th>
                <th style={{...styles.th, width: '25%'}}>Nome Visualização</th>
                <th style={styles.th}>Tipo</th>
                <th style={{...styles.th, width: '10%'}}>Remover</th>
            </tr>
            </thead>
            <tbody>
            {medidas.length === 0 ? (
                <tr><td colSpan={4} style={styles.empty}>Nenhum registro encontrado.</td></tr>
            ) : medidas.map((m) => (
                <tr key={m.id ?? m._k ?? `${m.nomeVisualizacao}-${m._coluna}`}>
                    <td style={styles.td}>{m._coluna ?? '—'}</td>
                    <td style={styles.td}>
                        <input
                            className="form-input"
                            value={m.nomeVisualizacao}
                            onChange={(e) => {
                                setMedidas(medidas.map((x) => (x === m ? {...x, nomeVisualizacao: e.target.value, _dirty: x.id ? true : x._dirty} : x)));
                            }}
                        />
                    </td>
                    <td style={styles.td}>
                        <div style={{display: 'flex', gap: '4px', flexWrap: 'wrap'}}>
                            {TIPOS_MEDIDA.map((t) => (
                                <button
                                    key={t.value}
                                    type="button"
                                    className={t.className}
                                    title={t.title}
                                    disabled={m.tipoInfo === t.value}
                                    style={m.tipoInfo === t.value ? {opacity: 0.4, cursor: 'not-allowed'} : undefined}
                                    onClick={() => setTipoMedida(m, t.value)}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </td>
                    <td style={styles.td}>
                        <button type="button" className="btnred" onClick={() => removeMedida(m)}>Remover</button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );

    const TabelaGeoreferencias = () => (
        <table style={styles.table}>
            <thead>
            <tr>
                <th style={{...styles.th, width: '40%'}}>Coluna</th>
                <th style={{...styles.th, width: '40%'}}>Nome Visualização</th>
                <th style={{...styles.th, width: '20%'}}>Remover</th>
            </tr>
            </thead>
            <tbody>
            {georeferencias.length === 0 ? (
                <tr><td colSpan={3} style={styles.empty}>Nenhum registro encontrado.</td></tr>
            ) : georeferencias.map((g) => (
                <tr key={g.id ?? g._k ?? `${g.nomeVisualizacao}-${g._coluna}`}>
                    <td style={styles.td}>{g._coluna ?? '—'}</td>
                    <td style={styles.td}>
                        <input
                            className="form-input"
                            value={g.nomeVisualizacao}
                            onChange={(e) => updateGeoNome(g, e.target.value)}
                        />
                    </td>
                    <td style={styles.td}>
                        <button type="button" className="btnred" onClick={() => removeGeoreferencia(g)}>Remover</button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );

    /* ── Passo SQL ──────────────────────────────────────────────────────────────── */
    const sqlContent = (
        <div>
            <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start'}}>
                <div style={{flex: '1 1 300px', border: '1px solid #ddd', borderRadius: '8px', padding: '16px'}}>
                    <h4 style={{margin: '0 0 10px', borderBottom: '1px solid #eee', paddingBottom: '8px'}}>Definições</h4>
                    <div style={{marginBottom: '12px'}}>
                        <label className="form-label">Nome colunas</label>
                        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px'}}>
                            {FORMATOS_TEXTO.map((f) => (
                                <label key={f.value} style={{display: 'inline-flex', alignItems: 'center', gap: '4px'}}>
                                    <input
                                        type="radio"
                                        name="formatoTexto"
                                        value={f.value}
                                        checked={data.definicoes.formatoTexto === f.value}
                                        onChange={() => updateFields({definicoes: {...data.definicoes, formatoTexto: f.value}})}
                                    />
                                    <span>{f.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="form-label" style={{display: 'block', marginBottom: '6px'}}>Remover símbolos</label>
                        <BooleanField
                            value={data.definicoes.simboloTexto}
                            onChange={(v) => updateFields({definicoes: {...data.definicoes, simboloTexto: v}})}
                        />
                    </div>
                </div>

                <div style={{flex: '1 1 300px', border: '1px solid #ddd', borderRadius: '8px', padding: '16px'}}>
                    <h4 style={{margin: '0 0 10px', borderBottom: '1px solid #eee', paddingBottom: '8px'}}>Mapas</h4>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '12px'}}>
                        <label className="form-field">
                            <span className="form-label">Token</span>
                            <select
                                className="form-input form-select"
                                value={data.entity.configuracaoEmailId ?? ''}
                                onChange={(e) => updateFields({entity: {...data.entity, configuracaoEmailId: e.target.value ? Number(e.target.value) : undefined}})}
                            >
                                <option value="">-- Selecione --</option>
                                {configuracoesEmail.map((ce) => (
                                    <option key={ce.id} value={ce.id}>{ce.username}</option>
                                ))}
                            </select>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Coordenada <span style={{color: '#C90000'}}>*</span></span>
                            <input
                                className="form-input"
                                value={data.entity.coordenada ?? ''}
                                onChange={(e) => updateFields({entity: {...data.entity, coordenada: e.target.value}})}
                            />
                        </label>
                        <label className="form-field">
                            <span className="form-label">Zoom <span style={{color: '#C90000'}}>*</span></span>
                            <input
                                className="form-input"
                                type="number"
                                value={data.entity.zoom ?? ''}
                                onChange={(e) => updateFields({entity: {...data.entity, zoom: e.target.value}})}
                            />
                        </label>
                    </div>
                </div>
            </div>

            <div style={{marginTop: '16px'}}>
                <Tabs
                    tabs={[
                        {
                            key: 'estrutura',
                            label: 'Estrutura',
                            content: (
                                <div>
                                    <label className="form-field">
                                        <span className="form-label">Tabela</span>
                                        <textarea
                                            className="form-input"
                                            rows={10}
                                            style={{width: '99%', minHeight: '120px', resize: 'vertical'}}
                                            value={data.entity.tabela ?? ''}
                                            onChange={(e) => updateFields({entity: {...data.entity, tabela: e.target.value}})}
                                        />
                                    </label>
                                    <label className="form-field" style={{display: 'block', marginTop: '12px'}}>
                                        <span className="form-label">Condições</span>
                                        <textarea
                                            className="form-input"
                                            rows={10}
                                            style={{width: '99%', minHeight: '120px', resize: 'vertical'}}
                                            value={data.entity.condicao ?? ''}
                                            onChange={(e) => updateFields({entity: {...data.entity, condicao: e.target.value}})}
                                        />
                                    </label>
                                    <div style={{marginTop: '12px'}}>
                                        <span className="form-label">Paginação</span>
                                        <code style={{display: 'block', marginTop: '4px', background: '#f5f5f5', padding: '8px', borderRadius: '4px'}}>
                                            {PAGINACAO_SQL}
                                        </code>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            key: 'colunas',
                            label: 'Colunas',
                            content: (
                                <div>
                                    <textarea
                                        className="form-input"
                                        rows={10}
                                        style={{width: '99%', minHeight: '120px', resize: 'vertical'}}
                                        placeholder={'Separe as colunas com ' + QUEBRA_COLUNA}
                                        value={novaColunaSql}
                                        onChange={(e) => setNovaColunaSql(e.target.value)}
                                    />
                                    <div style={{marginTop: '8px', textAlign: 'right'}}>
                                        <button type="button" className="btnblue" onClick={addColunasLista}>+ Adicionar lista</button>
                                    </div>
                                    <table style={{...styles.table, marginTop: '12px'}}>
                                        <thead>
                                        <tr>
                                            <th style={styles.th}>Coluna</th>
                                            <th style={{...styles.th, width: '100px'}}>Ações</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {colunas.length === 0 ? (
                                            <tr><td colSpan={2} style={styles.empty}>Nenhum registro encontrado.</td></tr>
                                        ) : colunas.map((c) => (
                                            <tr key={c.id ?? c._k}>
                                                <td style={styles.td}>
                                                    <textarea
                                                        className="form-input"
                                                        rows={1}
                                                        style={{width: '100%', resize: 'vertical'}}
                                                        value={c.coluna}
                                                        onChange={(e) => updateColunaItem(c, e.target.value)}
                                                    />
                                                </td>
                                                <td style={styles.td}>
                                                    <div style={{display: 'flex', gap: '4px'}}>
                                                        <button type="button" className="btnred" title="Remove da lista" onClick={() => removeColuna(c)}>−</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    );

    /* ── Passo Campos ───────────────────────────────────────────────────────────── */
    const camposContent = (
        <div>
            <div className="tabs-container">
                <nav className="tabs">
                    {[
                        {key: 'dimensao', label: 'Descrição'},
                        {key: 'tempo', label: 'Tempo'},
                        {key: 'medida', label: 'Medida'},
                        {key: 'geo', label: 'Georeferencia'},
                    ].map((t) => (
                        <button key={t.key} type="button" className="tab">{t.label}</button>
                    ))}
                </nav>
            </div>
            <Tabs
                tabs={[
                    {
                        key: 'dimensao',
                        label: 'Descrição',
                        content: (
                            <div>
                                <div style={styles.rowAdd}>
                                    <input
                                        className="form-input"
                                        style={{width: '220px'}}
                                        placeholder="Nome visualização"
                                        value={dimForm.nomeVisualizacao}
                                        onChange={(e) => setDimForm({...dimForm, nomeVisualizacao: e.target.value})}
                                    />
                                    {colunaSelect(dimForm.colunaK, (k) => setDimForm({...dimForm, colunaK: k}))}
                                    <button type="button" className="btn-form-save" onClick={addDimensao}>Adicionar</button>
                                </div>
                                <TabelaDim lista={dimensoes} vira={virarCoordenada} virarTitulo="Virar Coordenada"/>
                            </div>
                        ),
                    },
                    {
                        key: 'tempo',
                        label: 'Tempo',
                        content: (
                            <div>
                                <div style={styles.rowAdd}>
                                    <input
                                        className="form-input"
                                        style={{width: '220px'}}
                                        placeholder="Nome visualização"
                                        value={tempoForm.nomeVisualizacao}
                                        onChange={(e) => setTempoForm({...tempoForm, nomeVisualizacao: e.target.value})}
                                    />
                                    {colunaSelect(tempoForm.colunaK, (k) => setTempoForm({...tempoForm, colunaK: k}))}
                                    <button type="button" className="btn-form-save" onClick={addDimensaoTempo}>Adicionar</button>
                                </div>
                                <TabelaDim lista={dimensoesTempo} vira={virarDimensao} virarTitulo="Virar Descrição"/>
                            </div>
                        ),
                    },
                    {
                        key: 'medida',
                        label: 'Medida',
                        content: (
                            <div>
                                <div style={styles.rowAdd}>
                                    <input
                                        className="form-input"
                                        style={{width: '220px'}}
                                        placeholder="Nome visualização"
                                        value={medForm.nomeVisualizacao}
                                        onChange={(e) => setMedForm({...medForm, nomeVisualizacao: e.target.value})}
                                    />
                                    <select
                                        className="form-input form-select"
                                        style={{width: '160px'}}
                                        value={medForm.tipoInfo}
                                        onChange={(e) => setMedForm({...medForm, tipoInfo: e.target.value})}
                                    >
                                        {TIPOS_MEDIDA.map((t) => <option key={t.value} value={t.value}>{t.label.replace(' (%)', '').replace(' (R$)', '').replace(' (0,0)', '')}</option>)}
                                    </select>
                                    {colunaSelect(medForm.colunaK, (k) => setMedForm({...medForm, colunaK: k}))}
                                    <button type="button" className="btn-form-save" onClick={addMedida}>Adicionar</button>
                                </div>
                                <TabelaMedidas/>
                            </div>
                        ),
                    },
                    {
                        key: 'geo',
                        label: 'Georeferencia',
                        content: (
                            <div>
                                <div style={styles.rowAdd}>
                                    <input
                                        className="form-input"
                                        style={{width: '220px'}}
                                        placeholder="Nome visualização"
                                        value={geoForm.nomeVisualizacao}
                                        onChange={(e) => setGeoForm({...geoForm, nomeVisualizacao: e.target.value})}
                                    />
                                    {colunaSelect(geoForm.colunaK, (k) => setGeoForm({...geoForm, colunaK: k}))}
                                    <button type="button" className="btn-form-save" onClick={addGeoreferencia}>Adicionar</button>
                                </div>
                                <TabelaGeoreferencias/>
                            </div>
                        ),
                    },
                ]}
            />
            <div className="form-footer" style={{marginTop: '16px'}}>
                <button type="button" className="btn-form-back btnyellow" onClick={() => navigate('/view/estrutura/listEstrutura')}>Voltar</button>
                <button type="button" className="btn-form-save btnstop" onClick={handleSalvarEContinuar}>Salvar e Continuar</button>
            </div>
        </div>
    );

    return (
        <PermissionGate permission="READ">
            <main>
                <div className="div_form">
                    <div className="form-title">Estrutura de Relatório</div>
                    <div className="table_form">
                        <Wizard
                            initialData={data}
                            data={data}
                            onDataChange={updateFields}
                            onCancel={() => navigate('/view/estrutura/listEstrutura')}
                            steps={[
                                {
                                    key: 'sql',
                                    label: 'SQL',
                                    content: sqlContent,
                                    validate: async (d: EstruturaFormData) =>
                                        (d.entity.nome && d.entity.nome.length >= 3) || 'Nome deve ter pelo menos 3 caracteres',
                                },
                                {
                                    key: 'campos',
                                    label: 'Campos',
                                    nextLabel: 'Salvar',
                                    content: camposContent,
                                },
                            ]}
                            onComplete={handleComplete}
                        />
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}