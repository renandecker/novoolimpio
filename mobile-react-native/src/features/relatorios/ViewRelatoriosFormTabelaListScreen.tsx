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
    FILTRO_SOURCE,
    FILTRO_COLUMNS,
    FILTRO_SEARCH,
} from '../masterDetailSources';
import {useApi} from '../../shared/services/api';
import {API_PATHS} from '../../shared/services/apiPaths';
import {DataTable} from '../DataTable';
import {MasterDetail} from '../MasterDetail';
import type {ApiItem} from '../types';

const DIMENSAO_DESC_COLUMNS = [
    {key: 'id', label: 'ID'},
    {key: 'nomeVisualizacao', label: 'Dimensão Descritiva'},
];

const DIMENSAO_TEMPO_COLUMNS = [
    {key: 'id', label: 'ID'},
    {key: 'nomeVisualizacao', label: 'Dimensão Tempo'},
];

const MEDIDA_COLUMNS = [
    {key: 'id', label: 'ID'},
    {key: 'nomeVisualizacao', label: 'Medida'},
];

interface TabelaFormData {
    entity: {
        id?: number;
        nome?: string;
        estruturaId?: number;
    };
    dimensoesDescritivas: any[];
    dimensoesTempo: any[];
    medidas: any[];
    usuarios: ApiItem[];
    unidades: ApiItem[];
    perfis: ApiItem[];
    filtros: any[];
}

export default function ViewRelatoriosFormTabelaListScreen() {
    const [usuarios, setUsuarios] = useState<ApiItem[]>([]);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [perfis, setPerfis] = useState<ApiItem[]>([]);
    const [dimensoesDescritivas, setDimensoesDescritivas] = useState<any[]>([]);
    const [dimensoesTempo, setDimensoesTempo] = useState<any[]>([]);
    const [medidas, setMedidas] = useState<any[]>([]);
    const [filtros, setFiltros] = useState<any[]>([]);
    const [estruturaSelecionada, setEstruturaSelecionada] = useState<any>(null);

    const {post: saveTabela} = useApi(API_PATHS.relatorios.tabela);
    const {get: loadEstrutura} = useApi(API_PATHS.relatorios.estrutura);
    const {get: loadDimensoes} = useApi(API_PATHS.relatorios.dimensao);
    const {get: loadMedidas} = useApi(API_PATHS.relatorios.medida);
    const {get: loadFiltros} = useApi(API_PATHS.relatorios.filtro);
    const {post: saveFiltro} = useApi(API_PATHS.relatorios.filtro);
    const {delete: deleteFiltro} = useApi(API_PATHS.relatorios.filtro);

    const [entity, setEntity] = useState({nome: '', estruturaId: undefined});
    const [filtroNome, setFiltroNome] = useState('');
    const [filtroDimensao, setFiltroDimensao] = useState<any>(null);

    useEffect(() => {
        if (entity.estruturaId && entity.estruturaId !== estruturaSelecionada?.id) {
            loadEstruturaPorId(entity.estruturaId);
        }
    }, [entity.estruturaId]);

    const loadEstruturaPorId = async (id: number) => {
        try {
            const resp = await loadEstrutura(id);
            const estrutura = resp.data;
            setEstruturaSelecionada(estrutura);
            const [dimResp, medResp] = await Promise.all([
                loadDimensoes({estruturaId: id}),
                loadMedidas({estruturaId: id}),
            ]);
            setDimensoesDescritivas(dimResp.data.filter((d: any) => d.tipoInfo !== 'TEMPO'));
            setDimensoesTempo(dimResp.data.filter((d: any) => d.tipoInfo === 'TEMPO'));
            setMedidas(medResp.data);
        } catch (error) {
            console.error('Erro ao carregar estrutura:', error);
        }
    };

    const handleEstruturaSelect = (item: ApiItem) => {
        setEntity({...entity, estruturaId: item.id});
        setEstruturaSelecionada(item);
        loadEstruturaPorId(item.id);
    };

    const addDimensaoDescritiva = (item: ApiItem) => {
        if (!dimensoesDescritivas.find(d => d.id === item.id)) {
            setDimensoesDescritivas([...dimensoesDescritivas, item]);
        }
    };

    const removeDimensaoDescritiva = (item: any) => {
        setDimensoesDescritivas(dimensoesDescritivas.filter(d => d.id !== item.id));
    };

    const addDimensaoTempo = (item: ApiItem) => {
        if (!dimensoesTempo.find(d => d.id === item.id)) {
            setDimensoesTempo([...dimensoesTempo, item]);
        }
    };

    const removeDimensaoTempo = (item: any) => {
        setDimensoesTempo(dimensoesTempo.filter(d => d.id !== item.id));
    };

    const addMedida = (item: ApiItem) => {
        if (!medidas.find(m => m.id === item.id)) {
            setMedidas([...medidas, item]);
        }
    };

    const removeMedida = (item: any) => {
        setMedidas(medidas.filter(m => m.id !== item.id));
    };

    const handleSubmit = async () => {
        if (!entity.nome || entity.nome.length < 3) {
            alert('Nome deve ter pelo menos 3 caracteres');
            return;
        }
        try {
            await saveTabela({
                ...entity,
                usuarios,
                unidades,
                perfis,
                dimensoesDescritivas,
                dimensoesTempo,
                medidas,
                filtros,
            });
            alert('Tabela salva com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar tabela:', error);
            alert('Erro ao salvar tabela');
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
            title="Cadastro / Edição de Relatório de Tabela"
            tabs={[
                {
                    key: 'definicao',
                    label: 'Definição',
                    fields: [
                        {name: 'nome', label: 'Nome', required: true},
                        {name: 'estruturaId', label: 'Estrutura', type: 'autoComplete', autoCompleteSource: ESTRUTURA_SOURCE, autoCompleteSearchKeys: ESTRUTURA_SEARCH, autoCompleteColumns: ESTRUTURA_COLUMNS},
                    ],
                },
                {
                    key: 'dimensoes',
                    label: 'Dimensões & Medidas',
                    fields: [],
                    customContent: (
                        <>
                            <div style={{marginBottom: '20px'}}>
                                <h4>Dimensão Descritiva</h4>
                                <AutoComplete
                                    label="Adicionar"
                                    source={DIMENSAO_SOURCE}
                                    searchKeys={DIMENSAO_SEARCH}
                                    columns={DIMENSAO_COLUMNS}
                                    filterParams={{estruturaId: entity.estruturaId, tipoInfo: 'DESCRITIVA'}}
                                    onSelect={addDimensaoDescritiva}
                                />
                                <DataTable
                                    data={dimensoesDescritivas}
                                    columns={DIMENSAO_DESC_COLUMNS}
                                    actions={[
                                        {key: 'remove', label: 'Remover', icon: 'minus', className: 'btnblue', onClick: removeDimensaoDescritiva},
                                    ]}
                                />
                            </div>
                            <div style={{marginBottom: '20px'}}>
                                <h4>Dimensão Tempo</h4>
                                <AutoComplete
                                    label="Adicionar"
                                    source={DIMENSAO_SOURCE}
                                    searchKeys={DIMENSAO_SEARCH}
                                    columns={DIMENSAO_COLUMNS}
                                    filterParams={{estruturaId: entity.estruturaId, tipoInfo: 'TEMPO'}}
                                    onSelect={addDimensaoTempo}
                                />
                                <DataTable
                                    data={dimensoesTempo}
                                    columns={DIMENSAO_TEMPO_COLUMNS}
                                    actions={[
                                        {key: 'remove', label: 'Remover', icon: 'minus', className: 'btnblue', onClick: removeDimensaoTempo},
                                    ]}
                                />
                            </div>
                            <div style={{marginBottom: '20px'}}>
                                <h4>Medidas</h4>
                                <AutoComplete
                                    label="Adicionar"
                                    source={MEDIDA_SOURCE}
                                    searchKeys={MEDIDA_SEARCH}
                                    columns={MEDIDA_COLUMNS}
                                    filterParams={{estruturaId: entity.estruturaId}}
                                    onSelect={addMedida}
                                />
                                <DataTable
                                    data={medidas}
                                    columns={MEDIDA_COLUMNS}
                                    actions={[
                                        {key: 'remove', label: 'Remover', icon: 'minus', className: 'btnblue', onClick: removeMedida},
                                    ]}
                                />
                            </div>
                        </>
                    ),
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
                    nextLabel: 'Concluir',
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