import React, {useState, useEffect} from 'react';
import {FormLayout, FormTabConfig} from '../FormLayout';
import {AutoComplete} from '../AutoComplete';
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
} from '../masterDetailSources';
import {useApi} from '../../shared/services/api';
import {API_PATHS} from '../../shared/services/apiPaths';
import {DataTable} from '../DataTable';
import {MasterDetail} from '../MasterDetail';
import type {ApiItem} from '../types';

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
    tipoValor: boolean;
    markerTamanho: number;
    medidaId?: number;
    condicao: string;
    meta?: number;
    medidaMetaId?: number;
    meta2?: number;
    medidaMeta2Id?: number;
    descricao: string;
}

export default function ViewRelatoriosFormMapaListScreen() {
    const [usuarios, setUsuarios] = useState<ApiItem[]>([]);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [perfis, setPerfis] = useState<ApiItem[]>([]);
    const [regras, setRegras] = useState<any[]>([]);
    const [filtros, setFiltros] = useState<any[]>([]);
    const [estruturaSelecionada, setEstruturaSelecionada] = useState<any>(null);
    const [regraForm, setRegraForm] = useState<MapaRegraFormData>({
        cor: '#337ab7',
        tipoValor: false,
        markerTamanho: 10,
        condicao: 'EQ',
        descricao: '',
    });
    const [showRegraForm, setShowRegraForm] = useState(false);

    const {post: saveMapa} = useApi(API_PATHS.relatorios.mapa);
    const {get: loadEstrutura} = useApi(API_PATHS.relatorios.estrutura);
    const {get: loadFiltros} = useApi(API_PATHS.relatorios.filtro);
    const {post: saveFiltro} = useApi(API_PATHS.relatorios.filtro);
    const {delete: deleteFiltro} = useApi(API_PATHS.relatorios.filtro);
    const {post: saveRegra} = useApi(API_PATHS.relatorios.mapaRegra);
    const {delete: deleteRegra} = useApi(API_PATHS.relatorios.mapaRegra);

    const [entity, setEntity] = useState({
        nome: '',
        estruturaId: undefined,
        dimensaoId: undefined,
        medidaId: undefined,
        georeferenciaId: undefined,
        coordenada: '',
        zoom: undefined,
        markerTamanho: undefined,
        altura: undefined,
    });
    const [filtroNome, setFiltroNome] = useState('');
    const [filtroDimensao, setFiltroDimensao] = useState<any>(null);

    useEffect(() => {
        if (entity.estruturaId && entity.estruturaId !== estruturaSelecionada?.id) {
            loadEstrutura(entity.estruturaId).then(resp => setEstruturaSelecionada(resp.data));
        }
    }, [entity.estruturaId]);

    const handleSubmit = async () => {
        if (!entity.nome || entity.nome.length < 3) {
            alert('Nome deve ter pelo menos 3 caracteres');
            return;
        }
        if (!entity.coordenada) {
            alert('Informe a coordenada/área');
            return;
        }
        if (!entity.zoom || entity.zoom <= 0) {
            alert('Zoom deve ser maior que zero');
            return;
        }
        if (!entity.markerTamanho || entity.markerTamanho <= 0) {
            alert('Tamanho do marker deve ser maior que zero');
            return;
        }
        if (!entity.altura || entity.altura <= 0) {
            alert('Altura deve ser maior que zero');
            return;
        }
        if (!regras || regras.length === 0) {
            alert('Adicione pelo menos uma regra');
            return;
        }
        try {
            await saveMapa({
                ...entity,
                usuarios,
                unidades,
                perfis,
                regras,
                filtros,
            });
            alert('Mapa salvo com sucesso!');
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
            const regraData = {
                ...regraForm,
                mapaId: entity.id,
            };
            const resp = await saveRegra(regraData);
            setRegras([...regras, resp.data]);
            setRegraForm({
                cor: '#337ab7',
                tipoValor: false,
                markerTamanho: 10,
                condicao: 'EQ',
                descricao: '',
            });
            setShowRegraForm(false);
        } catch (error) {
            console.error('Erro ao adicionar regra:', error);
            alert('Erro ao adicionar regra');
        }
    };

    const removeRegra = async (regra: any) => {
        try {
            await deleteRegra(regra.id);
            setRegras(regras.filter(r => r.id !== regra.id));
        } catch (error) {
            console.error('Erro ao remover regra:', error);
            alert('Erro ao remover regra');
        }
    };

    const addFiltro = async () => {
        if (!filtroNome.trim() || !filtroDimensao) {
            alert('Informe nome e dimensão para o filtro');
            return;
        }
        try {
            const resp = await saveFiltro({
                nome: filtroNome,
                dimensaoId: filtroDimensao.id,
                estruturaId: entity.estruturaId,
            });
            setFiltros([...filtros, resp.data]);
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
            setFiltros(filtros.filter(f => f.id !== filtro.id));
        } catch (error) {
            console.error('Erro ao remover filtro:', error);
            alert('Erro ao remover filtro');
        }
    };

    return (
        <FormLayout
            title="Mapa / Relatório Geográfico"
            tabs={[
                {
                    key: 'definicao',
                    label: 'Definição',
                    fields: [
                        {name: 'nome', label: 'Nome *', required: true},
                        {name: 'estruturaId', label: 'Estrutura', type: 'autoComplete', autoCompleteSource: ESTRUTURA_SOURCE, autoCompleteSearchKeys: ESTRUTURA_SEARCH, autoCompleteColumns: ESTRUTURA_COLUMNS},
                        {name: 'dimensaoId', label: 'Dimensão', type: 'autoComplete', autoCompleteSource: DIMENSAO_SOURCE, autoCompleteSearchKeys: DIMENSAO_SEARCH, autoCompleteColumns: DIMENSAO_COLUMNS},
                        {name: 'medidaId', label: 'Medida', type: 'autoComplete', autoCompleteSource: MEDIDA_SOURCE, autoCompleteSearchKeys: MEDIDA_SEARCH, autoCompleteColumns: MEDIDA_COLUMNS},
                        {name: 'georeferenciaId', label: 'Coordenada (Georreferência)', type: 'autoComplete', autoCompleteSource: GEOREFERENCIA_SOURCE, autoCompleteSearchKeys: GEOREFERENCIA_SEARCH, autoCompleteColumns: GEOREFERENCIA_COLUMNS},
                        {name: 'coordenada', label: 'Área/Coordenada *', required: true},
                        {name: 'zoom', label: 'Zoom *', type: 'number', required: true, min: 1},
                        {name: 'markerTamanho', label: 'Tamanho Marker *', type: 'number', required: true, min: 1},
                        {name: 'altura', label: 'Altura *', type: 'number', required: true, min: 1},
                    ],
                },
                {
                    key: 'permissao',
                    label: 'Permissão',
                    fields: [],
                    customContent: (
                        <>
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
                        </>
                    ),
                },
                {
                    key: 'regras',
                    label: 'Regras',
                    fields: [],
                    customContent: (
                        <>
                            <div style={{marginBottom: '20px', padding: '15px', border: '1px solid #a8d0e6', borderRadius: '4px', backgroundColor: '#f8fbff'}}>
                                <h4>{showRegraForm ? 'Editar' : 'Adicionar'} Regra</h4>
                                <FormLayout
                                    title=""
                                    tabs={[
                                        {
                                            key: 'form',
                                            label: '',
                                            fields: [
                                                {name: 'cor', label: 'Cor Marcador', type: 'color'},
                                                {name: 'tipoValor', label: 'Tipo', type: 'select', options: [
                                                    {value: 'true', label: 'Medida'},
                                                    {value: 'false', label: 'Valor'},
                                                ], onChange: (v) => setRegraForm({...regraForm, tipoValor: v === 'true'})},
                                                {name: 'markerTamanho', label: 'Tamanho Marker *', type: 'number', required: true, min: 1},
                                                {name: 'medidaId', label: 'Medida', type: 'autoComplete', autoCompleteSource: MEDIDA_SOURCE, autoCompleteSearchKeys: MEDIDA_SEARCH, autoCompleteColumns: MEDIDA_COLUMNS, conditional: regraForm.tipoValor},
                                                {name: 'condicao', label: 'Condição', type: 'select', options: CONDICOES},
                                                {name: 'meta', label: 'Valor', type: 'number', step: 0.01, conditional: !regraForm.tipoValor && regraForm.condicao !== 'BETWEEN'},
                                                {name: 'medidaMetaId', label: 'Medida Meta', type: 'autoComplete', autoCompleteSource: MEDIDA_SOURCE, autoCompleteSearchKeys: MEDIDA_SEARCH, autoCompleteColumns: MEDIDA_COLUMNS, conditional: regraForm.tipoValor && regraForm.condicao !== 'BETWEEN'},
                                                {name: 'meta', label: 'Valor Inicial', type: 'number', step: 0.01, conditional: !regraForm.tipoValor && regraForm.condicao === 'BETWEEN'},
                                                {name: 'meta2', label: 'Valor Final', type: 'number', step: 0.01, conditional: !regraForm.tipoValor && regraForm.condicao === 'BETWEEN'},
                                                {name: 'medidaMetaId', label: 'Medida Meta Inicial', type: 'autoComplete', autoCompleteSource: MEDIDA_SOURCE, autoCompleteSearchKeys: MEDIDA_SEARCH, autoCompleteColumns: MEDIDA_COLUMNS, conditional: regraForm.tipoValor && regraForm.condicao === 'BETWEEN'},
                                                {name: 'medidaMeta2Id', label: 'Medida Meta Final', type: 'autoComplete', autoCompleteSource: MEDIDA_SOURCE, autoCompleteSearchKeys: MEDIDA_SEARCH, autoCompleteColumns: MEDIDA_COLUMNS, conditional: regraForm.tipoValor && regraForm.condicao === 'BETWEEN'},
                                                {name: 'descricao', label: 'Descrição *', required: true},
                                            ],
                                        },
                                    ]}
                                    initialValues={regraForm}
                                    onSubmit={(vals) => setRegraForm({...regraForm, ...vals})}
                                    onCancel={() => {setShowRegraForm(false); setRegraForm({cor: '#337ab7', tipoValor: false, markerTamanho: 10, condicao: 'EQ', descricao: ''});}}
                                    submitLabel="Adicionar Regra"
                                    cancelLabel="Cancelar"
                                />
                                {!showRegraForm && <button className="btn-form-save" onClick={() => setShowRegraForm(true)} style={{marginTop: '10px'}}>Nova Regra</button>}
                            </div>

                            <DataTable
                                data={regras}
                                columns={[
                                    {key: 'cor', label: 'Cor', render: (item: any) => <div style={{width: '20px', height: '20px', backgroundColor: item.cor, border: '1px solid #ccc'}}/>},
                                    {key: 'markerTamanho', label: 'Tamanho'},
                                    {key: 'tipoValor', label: 'Tipo', render: (item: any) => item.medidaMeta ? 'Medida' : 'Valor'},
                                    {key: 'medidaNome', label: 'Medida'},
                                    {key: 'condicao', label: 'Condição'},
                                    {key: 'meta', label: 'Valor/Meta'},
                                    {key: 'descricao', label: 'Descrição'},
                                ]}
                                actions={[
                                    {key: 'remove', label: 'Remover', icon: 'minus', className: 'btnred', onClick: removeRegra},
                                ]}
                            />
                        </>
                    ),
                },
                {
                    key: 'filtros',
                    label: 'Filtros',
                    fields: [
                        {name: 'nome', label: 'Nome *', required: true},
                        {name: 'dimensaoId', label: 'Dimensão', type: 'autoComplete', autoCompleteSource: DIMENSAO_SOURCE, autoCompleteSearchKeys: DIMENSAO_SEARCH, autoCompleteColumns: DIMENSAO_COLUMNS},
                    ],
                    customContent: (
                        <>
                            <DataTable
                                data={filtros}
                                columns={[
                                    {key: 'id', label: 'ID'},
                                    {key: 'nome', label: 'Nome'},
                                    {key: 'estruturaNome', label: 'Estrutura'},
                                    {key: 'dimensaoNome', label: 'Dimensão'},
                                ]}
                                actions={[
                                    {key: 'remove', label: 'Remover', icon: 'trash', className: 'btnred', onClick: removeFiltro},
                                ]}
                            />
                        </>
                    ),
                    nextLabel: 'Salvar',
                },
            ]}
            initialValues={entity}
            onSubmit={(vals) => setEntity({...entity, ...vals})}
            onCancel={() => console.log('Cancelar')}
            submitLabel="Salvar"
            cancelLabel="Voltar"
        />
    );
}