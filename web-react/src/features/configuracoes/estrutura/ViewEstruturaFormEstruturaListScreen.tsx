import {useState, useEffect} from 'react';
import {useSearchParams, useNavigate} from 'react-router-dom';

import {PermissionGate} from '../../../shared/services/permissions';
import {Wizard, useWizardData} from '../../../shared/components/Wizard';
import {DataTable, type DataTableColumn} from '../../../shared/components/DataTable';
import {FormLayout} from '../../../shared/components/FormLayout';
import {useApi, api} from '../../../shared/services/api';
import {API_PATHS} from '../../../shared/services/apiPaths';

const COLUNAS_COLUMNS: DataTableColumn[] = [
    {key: 'coluna', label: 'Coluna'},
];

const DIMENSAO_COLUMNS: DataTableColumn[] = [
    {key: 'nomeVisualizacao', label: 'Nome Visualização'},
    {key: 'tipoInfo', label: 'Tipo Info'},
    {key: 'coluna', label: 'Coluna'},
];

const MEDIDA_COLUMNS: DataTableColumn[] = [
    {key: 'nomeVisualizacao', label: 'Nome Visualização'},
    {key: 'tipoInfo', label: 'Tipo Info'},
    {key: 'coluna', label: 'Coluna'},
];

const GEOREFERENCIA_COLUMNS: DataTableColumn[] = [
    {key: 'nomeVisualizacao', label: 'Nome Visualização'},
    {key: 'coluna', label: 'Coluna'},
];

const TIPO_DIMENSAO_OPTIONS = [
    {value: 'DESCRITIVO', label: 'Descritivo'},
    {value: 'TEMPO', label: 'Tempo'},
];

const TIPO_MEDIDA_OPTIONS = [
    {value: 'MOEDA', label: 'Moeda'},
    {value: 'NUMERO', label: 'Número'},
    {value: 'CONTAGEM', label: 'Contagem'},
    {value: 'CONTAGEM-DISTINTA', label: 'Contagem Distinta'},
];

interface ColunaItem {
    id?: number;
    coluna: string;
    _k?: number;
    _pending?: boolean;
}

interface DimItem {
    id?: number;
    nomeVisualizacao: string;
    tipoInfo: string;
    estruturaColunaId?: number;
    _colunaK?: number;
    _pending?: boolean;
}

interface GeoItem {
    id?: number;
    nomeVisualizacao: string;
    estruturaColunaId?: number;
    _colunaK?: number;
    _pending?: boolean;
}

interface EstruturaFormData {
    entity: {
        id?: number;
        nome?: string;
        tabela?: string;
        condicao?: string;
        nomeBanco?: string;
        coordenada?: string;
        zoom?: number;
    };
    colunas: ColunaItem[];
    dimensoes: DimItem[];
    medidas: (DimItem & {tipo: string})[];
    georeferencias: GeoItem[];
}

let seq = 0;

export default function ViewEstruturaFormEstruturaListScreen() {
    const [colunas, setColunas] = useState<ColunaItem[]>([]);
    const [dimensoes, setDimensoes] = useState<DimItem[]>([]);
    const [medidas, setMedidas] = useState<(DimItem & {tipo: string})[]>([]);
    const [georeferencias, setGeoreferencias] = useState<GeoItem[]>([]);

    // Inputs dos painéis de adição
    const [novaColuna, setNovaColuna] = useState('');
    const [dimForm, setDimForm] = useState<{nomeVisualizacao: string; tipoInfo: string; colunaK?: number}>({nomeVisualizacao: '', tipoInfo: 'DESCRITIVO'});
    const [medForm, setMedForm] = useState<{nomeVisualizacao: string; tipoInfo: string; colunaK?: number}>({nomeVisualizacao: '', tipoInfo: 'MOEDA'});
    const [geoForm, setGeoForm] = useState<{nomeVisualizacao: string; colunaK?: number}>({nomeVisualizacao: ''});

    const {data, updateFields} = useWizardData<EstruturaFormData>({
        entity: {},
        colunas: [],
        dimensoes: [],
        medidas: [],
        georeferencias: [],
    });

    const {post: saveEstrutura} = useApi(API_PATHS.relatorios.estrutura);
    const {put: updateEstrutura} = useApi(API_PATHS.relatorios.estrutura);
    const loadEstruturaPorId = async (id: number) => (await api.get(`${API_PATHS.relatorios.estrutura}/${id}`)).data;
    const {get: loadColunas} = useApi(API_PATHS.relatorios.estruturaColuna);
    const {get: loadDimensoes} = useApi(API_PATHS.relatorios.dimensao);
    const {get: loadMedidas} = useApi(API_PATHS.relatorios.medida);
    const {get: loadGeoreferencias} = useApi(API_PATHS.relatorios.georeferencia);
    const {post: createColuna} = useApi(API_PATHS.relatorios.estruturaColuna);
    const {delete: deleteColuna} = useApi(API_PATHS.relatorios.estruturaColuna);
    const {post: createDimensao} = useApi(API_PATHS.relatorios.dimensao);
    const {delete: deleteDimensao} = useApi(API_PATHS.relatorios.dimensao);
    const {post: createMedida} = useApi(API_PATHS.relatorios.medida);
    const {delete: deleteMedida} = useApi(API_PATHS.relatorios.medida);
    const {post: createGeoreferencia} = useApi(API_PATHS.relatorios.georeferencia);
    const {delete: deleteGeoreferencia} = useApi(API_PATHS.relatorios.georeferencia);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const editingId = searchParams.get('id') ? Number(searchParams.get('id')) : undefined;

    useEffect(() => {
        if (editingId) {
            loadEstruturaPorId(editingId).then(async (estrutura: any) => {
                    updateFields({entity: {...data.entity, ...estrutura}});

                    const [colsRes, dimsRes, medsRes, geosRes] = await Promise.allSettled([
                        loadColunas(),
                        loadDimensoes({estruturaId: editingId}),
                        loadMedidas({estruturaId: editingId}),
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

                    const colsDaEstrutura = (cols ?? []).filter((c: any) => c.estruturaId === editingId);
                    setColunas(colsDaEstrutura);
                    setDimensoes((dims ?? []).filter((d: any) => d.estruturaId === editingId));
                    setMedidas((meds ?? []).filter((m: any) => m.estruturaId === editingId));
                    setGeoreferencias((geos ?? []).filter((g: any) => g.estruturaId === editingId));
                })
                .catch((error) => console.error('Erro ao carregar estrutura:', error));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingId]);

    const addColuna = () => {
        const nome = novaColuna.trim();
        if (!nome) return;
        setColunas([...colunas, {coluna: nome, _k: seq++, _pending: true}]);
        setNovaColuna('');
    };

    const removeColuna = async (item: any) => {
        if (item.id) {
            try { await deleteColuna(item.id); } catch (e) { console.error('Erro ao remover coluna:', e); }
        }
        setColunas(colunas.filter(c => c !== item));
    };

    const addDimensao = () => {
        if (!dimForm.nomeVisualizacao.trim()) return;
        const colunaK = dimForm.colunaK;
        setDimensoes([...dimensoes, {nomeVisualizacao: dimForm.nomeVisualizacao.trim(), tipoInfo: dimForm.tipoInfo, _colunaK: colunaK, _pending: true}]);
        setDimForm({nomeVisualizacao: '', tipoInfo: 'DESCRITIVO'});
    };

    const removeDimensao = async (item: any) => {
        if (item.id) {
            try { await deleteDimensao(item.id); } catch (e) { console.error('Erro ao remover dimensão:', e); }
        }
        setDimensoes(dimensoes.filter(d => d !== item));
    };

    const addMedida = () => {
        if (!medForm.nomeVisualizacao.trim()) return;
        setMedidas([...medidas, {nomeVisualizacao: medForm.nomeVisualizacao.trim(), tipo: 'MEDIDA', tipoInfo: medForm.tipoInfo, _colunaK: medForm.colunaK, _pending: true}]);
        setMedForm({nomeVisualizacao: '', tipoInfo: 'MOEDA'});
    };

    const removeMedida = async (item: any) => {
        if (item.id) {
            try { await deleteMedida(item.id); } catch (e) { console.error('Erro ao remover medida:', e); }
        }
        setMedidas(medidas.filter(m => m !== item));
    };

    const addGeoreferencia = () => {
        if (!geoForm.nomeVisualizacao.trim()) return;
        setGeoreferencias([...georeferencias, {nomeVisualizacao: geoForm.nomeVisualizacao.trim(), _colunaK: geoForm.colunaK, _pending: true}]);
        setGeoForm({nomeVisualizacao: ''});
    };

    const removeGeoreferencia = async (item: any) => {
        if (item.id) {
            try { await deleteGeoreferencia(item.id); } catch (e) { console.error('Erro ao remover georeferência:', e); }
        }
        setGeoreferencias(georeferencias.filter(g => g !== item));
    };

    const colunaSelect = (value: number | undefined, onChange: (k: number | undefined) => void) => (
        <select
            className="form-input form-select"
            style={{width: '220px'}}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        >
            <option value="">— Sem coluna —</option>
            {colunas.map((c) => (
                <option key={c._k ?? c.id} value={c._k ?? c.id}>{c.coluna}</option>
            ))}
        </select>
    );

    const handleComplete = async (formData: EstruturaFormData) => {
        try {
            const payload = {
                nome: formData.entity.nome,
                tabela: formData.entity.tabela,
                condicao: formData.entity.condicao,
                nomeBanco: formData.entity.nomeBanco,
                coordenada: formData.entity.coordenada,
                zoom: formData.entity.zoom,
            };
            const savedId = editingId
                ? await updateEstrutura(editingId, payload).then((e: any) => e.id)
                : await saveEstrutura(payload).then((e: any) => e.id);

            // 1) cria colunas pendentes e mapeia a chave temporaria -> id real
            const colunaIdMap = new Map<number, number>();
            for (const c of formData.colunas) {
                if (c._pending) {
                    const criada = await createColuna({coluna: c.coluna, estruturaId: savedId});
                    if (c._k !== undefined) colunaIdMap.set(c._k, criada.id);
                }
            }
            // 2) cria dimensoes, medidas e georeferencias pendentes
            const resolveColunaId = (k?: number) => (k !== undefined ? colunaIdMap.get(k) : undefined);
            for (const d of formData.dimensoes) {
                if (d._pending) {
                    await createDimensao({
                        nomeVisualizacao: d.nomeVisualizacao,
                        tipo: 'DIMENSAO',
                        tipoInfo: d.tipoInfo,
                        estruturaId: savedId,
                        estruturaColunaId: resolveColunaId(d._colunaK) ?? d.estruturaColunaId,
                    });
                }
            }
            for (const m of formData.medidas) {
                if (m._pending) {
                    await createMedida({
                        nomeVisualizacao: m.nomeVisualizacao,
                        tipo: 'MEDIDA',
                        tipoInfo: m.tipoInfo,
                        estruturaId: savedId,
                        estruturaColunaId: resolveColunaId(m._colunaK) ?? m.estruturaColunaId,
                    });
                }
            }
            for (const g of formData.georeferencias) {
                if (g._pending) {
                    await createGeoreferencia({
                        nomeVisualizacao: g.nomeVisualizacao,
                        estruturaId: savedId,
                        estruturaColunaId: resolveColunaId(g._colunaK) ?? g.estruturaColunaId,
                    });
                }
            }

            alert('Estrutura salva com sucesso!');
            navigate('/view/estrutura/listEstrutura');
        } catch (error) {
            console.error('Erro ao salvar estrutura:', error);
            alert('Erro ao salvar estrutura');
        }
    };

    const sqlTab = {
        key: 'principal',
        label: 'Principal',
        fields: [
            {name: 'nome', label: 'Nome *', required: true},
            {name: 'tabela', label: 'Tabela'},
            {name: 'condicao', label: 'Condição', type: 'textarea'},
            {name: 'nomeBanco', label: 'Banco'},
            {name: 'coordenada', label: 'Coordenada'},
            {name: 'zoom', label: 'Zoom', type: 'number', min: 0},
        ],
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <div className="div_form">
                    <div className="form-title">Estrutura de Relatório</div>
                    <div className="table_form">
                        <Wizard
                            initialData={data}
                            onDataChange={updateFields}
                            steps={[
                                {
                                    key: 'sql',
                                    label: 'SQL',
                                    content: (
                                        <div>
                                            <FormLayout
                                                title="Dados da Estrutura"
                                                tabs={[sqlTab] as any}
                                                initialValues={data.entity}
                                                onSubmit={(vals) => updateFields({entity: {...data.entity, ...vals}})}
                                                onCancel={() => {}}
                                                submitLabel=""
                                                cancelLabel=""
                                            />
                                        </div>
                                    ),
                                    validate: async (d: EstruturaFormData) => (d.entity.nome && d.entity.nome.length >= 3) || 'Nome deve ter pelo menos 3 caracteres',
                                },
                                {
                                    key: 'campos',
                                    label: 'Campos',
                                    nextLabel: 'Salvar',
                                    content: (
                                        <div>
                                            <div style={{marginBottom: '20px'}}>
                                                <h3>Colunas da Estrutura</h3>
                                                <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
                                                    <input
                                                        className="form-input"
                                                        style={{width: '220px'}}
                                                        placeholder="Nome da coluna"
                                                        value={novaColuna}
                                                        onChange={(e) => setNovaColuna(e.target.value)}
                                                    />
                                                    <button className="btn-form-save" onClick={addColuna} style={{flex: 0, whiteSpace: 'nowrap'}}>Adicionar</button>
                                                </div>
                                                <DataTable
                                                    data={colunas}
                                                    columns={COLUNAS_COLUMNS}
                                                    actions={[{key: 'remove', label: 'Remover', icon: 'minus', className: 'btnred', onClick: removeColuna}]}
                                                />
                                            </div>

                                            <div style={{marginBottom: '20px'}}>
                                                <h3>Dimensões</h3>
                                                <div style={{display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap'}}>
                                                    <input
                                                        className="form-input"
                                                        style={{width: '220px'}}
                                                        placeholder="Nome visualização"
                                                        value={dimForm.nomeVisualizacao}
                                                        onChange={(e) => setDimForm({...dimForm, nomeVisualizacao: e.target.value})}
                                                    />
                                                    <select
                                                        className="form-input form-select"
                                                        style={{width: '160px'}}
                                                        value={dimForm.tipoInfo}
                                                        onChange={(e) => setDimForm({...dimForm, tipoInfo: e.target.value})}
                                                    >
                                                        {TIPO_DIMENSAO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                    </select>
                                                    {colunaSelect(dimForm.colunaK, (k) => setDimForm({...dimForm, colunaK: k}))}
                                                    <button className="btn-form-save" onClick={addDimensao} style={{flex: 0, whiteSpace: 'nowrap'}}>Adicionar</button>
                                                </div>
                                                <DataTable
                                                    data={dimensoes}
                                                    columns={DIMENSAO_COLUMNS}
                                                    actions={[{key: 'remove', label: 'Remover', icon: 'minus', className: 'btnred', onClick: removeDimensao}]}
                                                />
                                            </div>

                                            <div style={{marginBottom: '20px'}}>
                                                <h3>Medidas</h3>
                                                <div style={{display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap'}}>
                                                    <input
                                                        className="form-input"
                                                        style={{width: '220px'}}
                                                        placeholder="Nome visualização"
                                                        value={medForm.nomeVisualizacao}
                                                        onChange={(e) => setMedForm({...medForm, nomeVisualizacao: e.target.value})}
                                                    />
                                                    <select
                                                        className="form-input form-select"
                                                        style={{width: '180px'}}
                                                        value={medForm.tipoInfo}
                                                        onChange={(e) => setMedForm({...medForm, tipoInfo: e.target.value})}
                                                    >
                                                        {TIPO_MEDIDA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                    </select>
                                                    {colunaSelect(medForm.colunaK, (k) => setMedForm({...medForm, colunaK: k}))}
                                                    <button className="btn-form-save" onClick={addMedida} style={{flex: 0, whiteSpace: 'nowrap'}}>Adicionar</button>
                                                </div>
                                                <DataTable
                                                    data={medidas}
                                                    columns={MEDIDA_COLUMNS}
                                                    actions={[{key: 'remove', label: 'Remover', icon: 'minus', className: 'btnred', onClick: removeMedida}]}
                                                />
                                            </div>

                                            <div style={{marginBottom: '20px'}}>
                                                <h3>Georeferências</h3>
                                                <div style={{display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap'}}>
                                                    <input
                                                        className="form-input"
                                                        style={{width: '220px'}}
                                                        placeholder="Nome visualização"
                                                        value={geoForm.nomeVisualizacao}
                                                        onChange={(e) => setGeoForm({...geoForm, nomeVisualizacao: e.target.value})}
                                                    />
                                                    {colunaSelect(geoForm.colunaK, (k) => setGeoForm({...geoForm, colunaK: k}))}
                                                    <button className="btn-form-save" onClick={addGeoreferencia} style={{flex: 0, whiteSpace: 'nowrap'}}>Adicionar</button>
                                                </div>
                                                <DataTable
                                                    data={georeferencias}
                                                    columns={GEOREFERENCIA_COLUMNS}
                                                    actions={[{key: 'remove', label: 'Remover', icon: 'minus', className: 'btnred', onClick: removeGeoreferencia}]}
                                                />
                                            </div>
                                        </div>
                                    ),
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
