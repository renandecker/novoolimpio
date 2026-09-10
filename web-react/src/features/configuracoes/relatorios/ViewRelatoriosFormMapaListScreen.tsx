import React, {useState, useEffect} from 'react';
import {useSearchParams, useNavigate} from 'react-router-dom';

import {PermissionGate} from '../../../shared/services/permissions';
import {MasterDetail} from '../../../shared/components/MasterDetail';
import {Tabs} from '../../../shared/components/Tabs';
import {Wizard, useWizardData} from '../../../shared/components/Wizard';
import {DataTable, type DataTableColumn} from '../../../shared/components/DataTable';
import {AutoComplete} from '../../../shared/components/AutoComplete';
import {
    PERFIL_SOURCE,
    PERFIL_COLUMNS,
    PERFIL_SEARCH,
    UNIDADE_SOURCE,
    UNIDADE_COLUMNS,
    UNIDADE_SEARCH,
    USUARIO_SOURCE,
    USUARIO_COLUMNS,
    USUARIO_SEARCH,
    ESTRUTURA_SOURCE,
    ESTRUTURA_COLUMNS,
    ESTRUTURA_SEARCH,
    DIMENSAO_SOURCE,
    DIMENSAO_COLUMNS,
    DIMENSAO_SEARCH,
    MEDIDA_SOURCE,
    MEDIDA_COLUMNS,
    MEDIDA_SEARCH,
    GEOREFERENCIA_SOURCE,
    GEOREFERENCIA_COLUMNS,
    GEOREFERENCIA_SEARCH,
    FILTRO_SOURCE,
    FILTRO_COLUMNS,
    FILTRO_SEARCH,
} from '../../../shared/services/masterDetailSources';
import type {ApiItem} from '../../../shared/types/types.ts';
import {useApi, api} from '../../../shared/services/api';
import {API_PATHS} from '../../../shared/services/apiPaths';
import {FormLayout, FormTabConfig} from '../../../shared/components/FormLayout';

const MAPA_REGRA_COLUMNS: DataTableColumn[] = [
    {key: 'cor', label: 'Cor Marcador', width: '80px', render: (item: any) => <div style={{width: '20px', height: '20px', backgroundColor: item.cor, border: '1px solid #ccc'}}/>},
    {key: 'markerTamanho', label: 'Tamanho', width: '60px'},
    {key: 'tipoValor', label: 'Tipo', width: '80px', render: (item: any) => item.medidaMeta ? 'Medida' : 'Valor'},
    {key: 'medidaNome', label: 'Medida', width: '20%'},
    {key: 'condicao', label: 'Condição', width: '120px'},
    {key: 'meta', label: 'Valor/Meta', width: '120px'},
    {key: 'descricao', label: 'Descrição', width: '30%'},
];

const FILTRO_COLUNAS: DataTableColumn[] = [
    {key: 'id', label: 'ID do Filtro', width: '80px'},
    {key: 'nome', label: 'Nome'},
    {key: 'estruturaNome', label: 'Estrutura'},
    {key: 'dimensaoNome', label: 'Dimensão'},
];

const CONDICOES = [
    {value: 'EQ', label: 'Igual'},
    {value: 'NE', label: 'Diferente'},
    {value: 'GT', label: 'Maior que'},
    {value: 'LT', label: 'Menor que'},
    {value: 'GTE', label: 'Maior ou igual'},
    {value: 'LTE', label: 'Menor ou igual'},
    {value: 'BETWEEN', label: 'Entre'},
    {value: 'IN', label: 'Na lista'},
    {value: 'NOT_IN', label: 'Não na lista'},
];

interface MapaFormData {
    entity: {
        id?: number;
        nome?: string;
        estruturaId?: number;
        dimensaoId?: number;
        medidaId?: number;
        georeferenciaId?: number;
        coordenada?: string;
        zoom?: number;
        markerTamanho?: number;
        altura?: number;
    };
    usuarios: ApiItem[];
    unidades: ApiItem[];
    perfis: ApiItem[];
    regras: any[];
    filtros: any[];
}

interface MapaRegraFormData {
    cor: string;
    tipoValor: boolean; // true = Medida, false = Valor
    markerTamanho: number;
    medidaId?: number;
    condicao: string;
    meta?: number;
    medidaMetaId?: number;
    meta2?: number;
    medidaMeta2Id?: number;
    descricao: string;
}

const RESET_REGRA: MapaRegraFormData = {
    cor: '#337ab7',
    tipoValor: false,
    markerTamanho: 10,
    condicao: 'EQ',
    descricao: '',
};

export default function ViewRelatoriosFormMapaListScreen() {
    const [usuarios, setUsuarios] = useState<ApiItem[]>([]);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [perfis, setPerfis] = useState<ApiItem[]>([]);
    const [regras, setRegras] = useState<any[]>([]);
    const [filtros, setFiltros] = useState<any[]>([]);
    const [estruturaSelecionada, setEstruturaSelecionada] = useState<ApiItem | null>(null);
    const [regraForm, setRegraForm] = useState<MapaRegraFormData>(RESET_REGRA);
    const [showRegraForm, setShowRegraForm] = useState(false);

    const {data, updateFields} = useWizardData<MapaFormData>({
        entity: {},
        usuarios: [],
        unidades: [],
        perfis: [],
        regras: [],
        filtros: [],
    });

    const {post: saveMapa} = useApi(API_PATHS.relatorios.mapa);
    const {put: updateMapa} = useApi(API_PATHS.relatorios.mapa);
    const loadMapaPorId = async (id: number) => (await api.get(`${API_PATHS.relatorios.mapa}/${id}`)).data;
    const loadEstrutura = async (id: number) => (await api.get(`${API_PATHS.relatorios.estrutura}/${id}`)).data;
    const {get: loadDimensoes} = useApi(API_PATHS.relatorios.dimensao);
    const {get: loadMedidas} = useApi(API_PATHS.relatorios.medida);
    const {get: loadGeoreferencias} = useApi(API_PATHS.relatorios.georeferencia);
    const {get: loadFiltros} = useApi(API_PATHS.relatorios.filtro);
    const {post: saveFiltro} = useApi(API_PATHS.relatorios.filtro);
    const {delete: deleteFiltro} = useApi(API_PATHS.relatorios.filtro);
    const {post: saveRegra} = useApi(API_PATHS.relatorios.mapaRegra);
    const {put: updateRegra} = useApi(API_PATHS.relatorios.mapaRegra);
    const loadRegraPorId = async (id: number) => (await api.get(`${API_PATHS.relatorios.mapaRegra}/${id}`)).data;
    const {delete: deleteRegra} = useApi(API_PATHS.relatorios.mapaRegra);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const editingId = searchParams.get('id') ? Number(searchParams.get('id')) : undefined;

    useEffect(() => {
        if (data.entity.estruturaId && data.entity.estruturaId !== estruturaSelecionada?.id) {
            loadEstruturaPorId(data.entity.estruturaId);
        }
    }, [data.entity.estruturaId]);

    useEffect(() => {
        if (editingId) {
            loadMapaPorId(editingId)
                .then(async (mapa: any) => {
                    updateFields({entity: {...data.entity, ...mapa}});
                    if (mapa.estruturaId) await loadEstruturaPorId(mapa.estruturaId);
                    const regraList = await api.get(`${API_PATHS.relatorios.mapaRegra}/mapa/${editingId}`);
                    setRegras(regraList.data ?? []);
                })
                .catch((error) => console.error('Erro ao carregar mapa:', error));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingId]);

    const loadEstruturaPorId = async (id: number) => {
        try {
            const estrutura = await loadEstrutura(id);
            setEstruturaSelecionada(estrutura);
        } catch (error) {
            console.error('Erro ao carregar estrutura:', error);
        }
    };

    const handleEstruturaSelect = (item: ApiItem) => {
        updateFields({entity: {...data.entity, estruturaId: item.id}});
        setEstruturaSelecionada(item);
        loadEstruturaPorId(item.id);
    };

    const regraPayload = (r: MapaRegraFormData, mapaId?: number) => ({
        descricao: r.descricao,
        cor: r.cor,
        markerTamanho: r.markerTamanho,
        condicao: r.condicao,
        ativo: true,
        meta: r.tipoValor ? undefined : r.meta,
        meta2: r.tipoValor ? undefined : r.meta2,
        medidaId: r.medidaId,
        medidaMetaId: r.tipoValor ? r.medidaMetaId : undefined,
        medidaMetaDoisId: r.tipoValor ? r.medidaMeta2Id : undefined,
        mapaId,
    });

    const handleComplete = async (formData: MapaFormData) => {
        try {
            const payload = {
                nome: formData.entity.nome,
                estruturaId: formData.entity.estruturaId,
                dimensaoId: formData.entity.dimensaoId,
                medidaId: formData.entity.medidaId,
                georeferenciaId: formData.entity.georeferenciaId,
                coordenada: formData.entity.coordenada,
                zoom: formData.entity.zoom,
                markerTamanho: formData.entity.markerTamanho,
                altura: formData.entity.altura,
                utilizando: true,
                todosUsuarios: formData.usuarios.length === 0,
                todosUnidades: formData.unidades.length === 0,
                todosPerfis: formData.perfis.length === 0,
            };
            const savedId = editingId
                ? await updateMapa(editingId, payload).then((m: any) => m.id)
                : await saveMapa(payload).then((m: any) => m.id);
            // Persiste regras pendentes (mapa novo) e regras ainda nao salvas
            for (const regra of formData.regras) {
                if (regra._pending) {
                    await saveRegra(regraPayload(regra, savedId));
                }
            }
            alert('Mapa salvo com sucesso!');
            navigate('/view/relatorios/listMapa');
        } catch (error) {
            console.error('Erro ao salvar mapa:', error);
            alert('Erro ao salvar mapa');
        }
    };

    const addRegra = async () => {
        if (!regraForm.medidaId && regraForm.tipoValor) {
            alert('Selecione uma medida');
            return;
        }
        if (!regraForm.tipoValor && (regraForm.meta === undefined || regraForm.meta === null)) {
            alert('Informe o valor');
            return;
        }
        if (regraForm.condicao === 'BETWEEN') {
            if (!regraForm.tipoValor && (regraForm.meta2 === undefined || regraForm.meta2 === null)) {
                alert('Informe o segundo valor para condição Entre');
                return;
            }
            if (regraForm.tipoValor && !regraForm.medidaMeta2Id) {
                alert('Selecione a segunda medida para condição Entre');
                return;
            }
        }
        try {
            if (editingId) {
                const newRegra = await saveRegra(regraPayload(regraForm, editingId));
                setRegras([...regras, {...regraForm, id: newRegra.id}]);
                updateFields({regras: [...regras, {...regraForm, id: newRegra.id}]});
            } else {
                const pending = {...regraForm, _pending: true};
                setRegras([...regras, pending]);
                updateFields({regras: [...regras, pending]});
            }
            setRegraForm(RESET_REGRA);
            setShowRegraForm(false);
        } catch (error) {
            console.error('Erro ao adicionar regra:', error);
            alert('Erro ao adicionar regra');
        }
    };

    const removeRegra = async (regra: any) => {
        try {
            if (!regra._pending && regra.id) await deleteRegra(regra.id);
            const newList = regras.filter(r => r !== regra);
            setRegras(newList);
            updateFields({regras: newList});
        } catch (error) {
            console.error('Erro ao remover regra:', error);
            alert('Erro ao remover regra');
        }
    };

    const [filtroNome, setFiltroNome] = useState('');
    const [filtroDimensao, setFiltroDimensao] = useState<ApiItem | null>(null);

    const addFiltro = async () => {
        if (!filtroNome.trim() || !filtroDimensao) {
            alert('Informe nome e dimensão para o filtro');
            return;
        }
        try {
            const newFiltro = await saveFiltro({
                nome: filtroNome,
                dimensaoId: filtroDimensao.id,
                estruturaId: data.entity.estruturaId,
            });
            setFiltros([...filtros, newFiltro]);
            updateFields({filtros: [...filtros, newFiltro]});
            setFiltroNome('');
            setFiltroDimensao(null);
        } catch (error) {
            console.error('Erro ao adicionar filtro:', error);
            alert('Erro ao adicionar filtro');
        }
    };

    const removeFiltro = async (filtro: any) => {
        try {
            await deleteFiltro(filtro.id);
            const newList = filtros.filter(f => f.id !== filtro.id);
            setFiltros(newList);
            updateFields({filtros: newList});
        } catch (error) {
            console.error('Erro ao remover filtro:', error);
            alert('Erro ao remover filtro');
        }
    };

    const validateStep1 = async (currentData: MapaFormData) => {
        if (!currentData.entity.nome || currentData.entity.nome.length < 3) {
            return 'Nome deve ter pelo menos 3 caracteres';
        }
        if (!currentData.entity.estruturaId) return 'Selecione uma estrutura';
        if (!currentData.entity.coordenada) return 'Informe a coordenada/área';
        if (!currentData.entity.zoom || currentData.entity.zoom <= 0) return 'Zoom deve ser maior que zero';
        if (!currentData.entity.markerTamanho || currentData.entity.markerTamanho <= 0) {
            return 'Tamanho do marker deve ser maior que zero';
        }
        if (!currentData.entity.altura || currentData.entity.altura <= 0) {
            return 'Altura deve ser maior que zero';
        }
        return true;
    };

    const validateStep3 = async (currentData: MapaFormData) => {
        if (!currentData.regras || currentData.regras.length === 0) {
            return 'Adicione pelo menos uma regra';
        }
        return true;
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <div className="div_form">
                    <div className="form-title">Mapa / Relatório Geográfico</div>
                    <div className="table_form">
                        <Wizard
                            initialData={data}
                            onDataChange={updateFields}
                            steps={[
                                {
                                    key: 'definicao',
                                    label: 'Definição',
                                    content: (
                                        <div>
                                            <FormLayout
                                                title="Configuração do Mapa"
                                                tabs={[
                                                    {
                                                        key: 'principal',
                                                        label: 'Principal',
                                                        fields: [
                                                            {name: 'nome', label: 'Nome *', required: true, span: 3},
                                                            {name: 'estruturaId', label: 'Estrutura', type: 'autoComplete', autoCompleteSource: ESTRUTURA_SOURCE, autoCompleteSearchKeys: ESTRUTURA_SEARCH, autoCompleteColumns: ESTRUTURA_COLUMNS, span: 3},
                                                            {name: 'dimensaoId', label: 'Dimensão', type: 'autoComplete', autoCompleteSource: DIMENSAO_SOURCE, autoCompleteSearchKeys: DIMENSAO_SEARCH, autoCompleteColumns: DIMENSAO_COLUMNS, filterParams: {estruturaId: data.entity.estruturaId}},
                                                            {name: 'medidaId', label: 'Medida', type: 'autoComplete', autoCompleteSource: MEDIDA_SOURCE, autoCompleteSearchKeys: MEDIDA_SEARCH, autoCompleteColumns: MEDIDA_COLUMNS, filterParams: {estruturaId: data.entity.estruturaId}},
                                                            {name: 'georeferenciaId', label: 'Coordenada (Georreferência)', type: 'autoComplete', autoCompleteSource: GEOREFERENCIA_SOURCE, autoCompleteSearchKeys: GEOREFERENCIA_SEARCH, autoCompleteColumns: GEOREFERENCIA_COLUMNS, filterParams: {estruturaId: data.entity.estruturaId}},
                                                        ],
                                                    },
                                                    {
                                                        key: 'visual',
                                                        label: 'Visual',
                                                        fields: [
                                                            {name: 'coordenada', label: 'Área/Coordenada *', required: true, span: 2},
                                                            {name: 'zoom', label: 'Zoom *', type: 'number', required: true, min: 1},
                                                            {name: 'markerTamanho', label: 'Tamanho Marker *', type: 'number', required: true, min: 1},
                                                            {name: 'altura', label: 'Altura *', type: 'number', required: true, min: 1},
                                                        ],
                                                    },
                                                    {
                                                        key: 'sql',
                                                        label: 'Configuração SQL',
                                                        fields: [
                                                            {name: 'estruturaTabela', label: 'Tabela da Estrutura *', required: true, span: 2},
                                                            {name: 'estruturaCondicao', label: 'Condição da Estrutura', type: 'textarea', span: 4},
                                                            {name: 'georeferenciaColuna', label: 'Coluna de Georeferência *', required: true, span: 2},
                                                            {name: 'dimensaoColuna', label: 'Coluna da Dimensão', span: 2},
                                                            {name: 'medidaColuna', label: 'Coluna da Medida *', required: true, span: 2},
                                                        ],
                                                    },
                                                ]}
                                                initialValues={data.entity}
                                                onSubmit={(vals) => updateFields({entity: {...data.entity, ...vals}})}
                                                onCancel={() => {}}
                                                submitLabel=""
                                                cancelLabel=""
                                            />
                                        </div>
                                    ),
                                    validate: validateStep1,
                                },
                                {
                                    key: 'permissao',
                                    label: 'Permissão',
                                    content: (
                                        <div>
                                            <div style={{marginBottom: '20px'}}>
                                                <h3>Usuários</h3>
                                                <MasterDetail
                                                    label="Usuário"
                                                    source={USUARIO_SOURCE}
                                                    valueKey="id"
                                                    searchKeys={USUARIO_SEARCH}
                                                    columns={USUARIO_COLUMNS}
                                                    items={usuarios}
                                                    onChange={setUsuarios}
                                                />
                                            </div>
                                            <div style={{marginBottom: '20px'}}>
                                                <h3>Unidades</h3>
                                                <MasterDetail
                                                    label="Unidade"
                                                    source={UNIDADE_SOURCE}
                                                    valueKey="id"
                                                    searchKeys={UNIDADE_SEARCH}
                                                    columns={UNIDADE_COLUMNS}
                                                    items={unidades}
                                                    onChange={setUnidades}
                                                />
                                            </div>
                                            <div style={{marginBottom: '20px'}}>
                                                <h3>Perfis</h3>
                                                <MasterDetail
                                                    label="Perfil"
                                                    source={PERFIL_SOURCE}
                                                    valueKey="id"
                                                    searchKeys={PERFIL_SEARCH}
                                                    columns={PERFIL_COLUMNS}
                                                    items={perfis}
                                                    onChange={setPerfis}
                                                />
                                            </div>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'regras',
                                    label: 'Regras',
                                    content: (
                                        <div>
                                            <div style={{marginBottom: '20px', padding: '15px', border: '1px solid #a8d0e6', borderRadius: '4px', backgroundColor: '#f8fbff'}}>
                                                <h4>{(showRegraForm ? 'Editar' : 'Adicionar') + ' Regra'}</h4>
                                                <FormLayout
                                                    title=""
                                                    tabs={[
                                                        {
                                                            key: 'form',
                                                            label: '',
                                                            fields: [
                                                                {name: 'cor', label: 'Cor Marcador', type: 'color', span: 1},
                                                                {name: 'tipoValor', label: 'Tipo', type: 'select', options: [
                                                                    {value: 'true', label: 'Medida'},
                                                                    {value: 'false', label: 'Valor'},
                                                                ], span: 1, onChange: (v) => setRegraForm({...regraForm, tipoValor: v === 'true'})},
                                                                {name: 'markerTamanho', label: 'Tamanho Marker *', type: 'number', required: true, min: 1, span: 1},
                                                                {name: 'medidaId', label: 'Medida', type: 'autoComplete', autoCompleteSource: MEDIDA_SOURCE, autoCompleteSearchKeys: MEDIDA_SEARCH, autoCompleteColumns: MEDIDA_COLUMNS, filterParams: {estruturaId: data.entity.estruturaId}, span: 2, conditional: regraForm.tipoValor},
                                                                {name: 'condicao', label: 'Condição', type: 'select', options: CONDICOES, span: 1},
                                                                {name: 'meta', label: 'Valor', type: 'number', step: 0.01, span: 2, conditional: !regraForm.tipoValor && regraForm.condicao !== 'BETWEEN'},
                                                                {name: 'medidaMetaId', label: 'Medida Meta', type: 'autoComplete', autoCompleteSource: MEDIDA_SOURCE, autoCompleteSearchKeys: MEDIDA_SEARCH, autoCompleteColumns: MEDIDA_COLUMNS, filterParams: {estruturaId: data.entity.estruturaId}, span: 2, conditional: regraForm.tipoValor && regraForm.condicao !== 'BETWEEN'},
                                                                {name: 'meta', label: 'Valor Inicial', type: 'number', step: 0.01, span: 1, conditional: !regraForm.tipoValor && regraForm.condicao === 'BETWEEN'},
                                                                {name: 'meta2', label: 'Valor Final', type: 'number', step: 0.01, span: 1, conditional: !regraForm.tipoValor && regraForm.condicao === 'BETWEEN'},
                                                                {name: 'medidaMetaId', label: 'Medida Meta Inicial', type: 'autoComplete', autoCompleteSource: MEDIDA_SOURCE, autoCompleteSearchKeys: MEDIDA_SEARCH, autoCompleteColumns: MEDIDA_COLUMNS, filterParams: {estruturaId: data.entity.estruturaId}, span: 2, conditional: regraForm.tipoValor && regraForm.condicao === 'BETWEEN'},
                                                                {name: 'medidaMeta2Id', label: 'Medida Meta Final', type: 'autoComplete', autoCompleteSource: MEDIDA_SOURCE, autoCompleteSearchKeys: MEDIDA_SEARCH, autoCompleteColumns: MEDIDA_COLUMNS, filterParams: {estruturaId: data.entity.estruturaId}, span: 2, conditional: regraForm.tipoValor && regraForm.condicao === 'BETWEEN'},
                                                                {name: 'descricao', label: 'Descrição *', required: true, span: 4},
                                                            ],
                                                        },
                                                    ]}
                                                    initialValues={{...regraForm}}
                                                    onSubmit={(vals) => setRegraForm({...regraForm, ...vals})}
                                                    onCancel={() => {setShowRegraForm(false); setRegraForm(RESET_REGRA);}}
                                                    submitLabel="Adicionar Regra"
                                                    cancelLabel="Cancelar"
                                                />
                                                {!showRegraForm && <button className="btn-form-save" onClick={() => setShowRegraForm(true)} style={{marginTop: '10px'}}>Nova Regra</button>}
                                            </div>

                                            <DataTable
                                                data={regras}
                                                columns={MAPA_REGRA_COLUMNS}
                                                actions={[
                                                    {key: 'remove', label: 'Remover', icon: 'minus', className: 'btnred', onClick: removeRegra},
                                                ]}
                                            />
                                        </div>
                                    ),
                                    validate: validateStep3,
                                },
                                {
                                    key: 'filtros',
                                    label: 'Filtros',
                                    content: (
                                        <div>
                                            <div style={{marginBottom: '20px', padding: '15px', border: '1px solid #a8d0e6', borderRadius: '4px', backgroundColor: '#f8fbff'}}>
                                                <h4>Criar Novo Filtro</h4>
                                                <FormLayout
                                                    title=""
                                                    tabs={[
                                                        {
                                                            key: 'form',
                                                            label: '',
                                                            fields: [
                                                                {name: 'nome', label: 'Nome *', required: true, span: 2},
                                                                {name: 'dimensaoId', label: 'Dimensão', type: 'autoComplete', autoCompleteSource: DIMENSAO_SOURCE, autoCompleteSearchKeys: DIMENSAO_SEARCH, autoCompleteColumns: DIMENSAO_COLUMNS, span: 2},
                                                            ],
                                                        },
                                                    ]}
                                                    initialValues={{nome: filtroNome, dimensaoId: filtroDimensao?.id}}
                                                    onSubmit={(vals) => {
                                                        setFiltroNome(vals.nome as string);
                                                    }}
                                                    onCancel={() => {}}
                                                    submitLabel="Adicionar Filtro"
                                                    cancelLabel=""
                                                />
                                            </div>
                                            <DataTable
                                                data={filtros}
                                                columns={FILTRO_COLUNAS}
                                                actions={[
                                                    {key: 'remove', label: 'Remover', icon: 'trash', className: 'btnred', onClick: removeFiltro},
                                                ]}
                                            />
                                        </div>
                                    ),
                                    nextLabel: editingId ? 'Salvar' : 'Salvar',
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
