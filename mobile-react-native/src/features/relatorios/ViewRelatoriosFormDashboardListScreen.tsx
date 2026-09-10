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
    TABELA_SOURCE,
    TABELA_COLUMNS,
    TABELA_SEARCH,
    GRAFICO_SOURCE,
    GRAFICO_COLUMNS,
    GRAFICO_SEARCH,
    MAPA_SOURCE,
    MAPA_COLUMNS,
    MAPA_SEARCH,
    PAINEL_PAINEL_SOURCE,
    PAINEL_PAINEL_COLUMNS,
    PAINEL_PAINEL_SEARCH,
} from '../masterDetailSources';
import {useApi} from '../../shared/services/api';
import {API_PATHS} from '../../shared/services/apiPaths';
import {DataTable} from '../DataTable';
import {MasterDetail} from '../MasterDetail';
import type {ApiItem} from '../types';

const TABELA_COLS = [
    {key: 'id', label: 'ID'},
    {key: 'nome', label: 'Nome'},
];

const GRAFICO_COLS = [
    {key: 'id', label: 'ID'},
    {key: 'nome', label: 'Nome'},
    {key: 'tipo', label: 'Tipo'},
];

const MAPA_COLS = [
    {key: 'id', label: 'ID'},
    {key: 'nome', label: 'Nome'},
];

const PAINEL_COLUMNS = [
    {key: 'relatorioNome', label: 'Relatório'},
    {key: 'tipo', label: 'Tipo'},
    {key: 'ordem', label: 'Ordem'},
];

interface DashboardFormData {
    entity: {
        id?: number;
        nome?: string;
        descricao?: string;
    };
    tabelas: any[];
    graficos: any[];
    mapas: any[];
    painelPainels: any[];
    usuarios: ApiItem[];
    unidades: ApiItem[];
    perfis: ApiItem[];
    filtros: any[];
}

export default function ViewRelatoriosFormDashboardListScreen() {
    const [usuarios, setUsuarios] = useState<ApiItem[]>([]);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [perfis, setPerfis] = useState<ApiItem[]>([]);
    const [tabelas, setTabelas] = useState<any[]>([]);
    const [graficos, setGraficos] = useState<any[]>([]);
    const [mapas, setMapas] = useState<any[]>([]);
    const [painelPainels, setPainelPainels] = useState<any[]>([]);
    const [filtros, setFiltros] = useState<any[]>([]);
    const [filtroSelecionados, setFiltroSelecionados] = useState<any[]>([]);

    const {post: saveDashboard} = useApi(API_PATHS.relatorios.dashboard);
    const {get: loadFiltros} = useApi(API_PATHS.relatorios.filtro);
    const {post: saveFiltro} = useApi(API_PATHS.relatorios.filtro);
    const {delete: deleteFiltro} = useApi(API_PATHS.relatorios.filtro);
    const {post: savePainel} = useApi(API_PATHS.relatorios.painelPainel);
    const {delete: deletePainel} = useApi(API_PATHS.relatorios.painelPainel);

    const [entity, setEntity] = useState({nome: '', descricao: ''});

    const addTabela = (item: ApiItem) => {
        if (!tabelas.find(t => t.id === item.id)) {
            setTabelas([...tabelas, item]);
        }
    };

    const removeTabela = (item: any) => {
        setTabelas(tabelas.filter(t => t.id !== item.id));
    };

    const addGrafico = (item: ApiItem) => {
        if (!graficos.find(g => g.id === item.id)) {
            setGraficos([...graficos, item]);
        }
    };

    const removeGrafico = (item: any) => {
        setGraficos(graficos.filter(g => g.id !== item.id));
    };

    const addMapa = (item: ApiItem) => {
        if (!mapas.find(m => m.id === item.id)) {
            setMapas([...mapas, item]);
        }
    };

    const removeMapa = (item: any) => {
        setMapas(mapas.filter(m => m.id !== item.id));
    };

    const addPainel = async (painel: {tabelaId?: number; graficoId?: number; mapaId?: number; ordem: number}) => {
        try {
            const resp = await savePainel({
                painelId: entity.id,
                ...painel,
            });
            setPainelPainels([...painelPainels, resp.data]);
        } catch (error) {
            console.error('Erro ao adicionar painel:', error);
            alert('Erro ao adicionar painel');
        }
    };

    const removePainel = async (painel: any) => {
        try {
            await deletePainel(painel.id);
            setPainelPainels(painelPainels.filter(p => p.id !== painel.id));
        } catch (error) {
            console.error('Erro ao remover painel:', error);
            alert('Erro ao remover painel');
        }
    };

    const handleSubmit = async () => {
        if (!entity.nome || entity.nome.length < 3) {
            alert('Nome deve ter pelo menos 3 caracteres');
            return;
        }
        try {
            await saveDashboard({
                ...entity,
                usuarios,
                unidades,
                perfis,
                tabelas,
                graficos,
                mapas,
                painelPainels,
                filtros,
            });
            alert('Dashboard salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar dashboard:', error);
            alert('Erro ao salvar dashboard');
        }
    };

    return (
        <FormLayout
            title="Cadastro / Edição de Relatório de Dashboard"
            tabs={[
                {
                    key: 'definicao',
                    label: 'Definição',
                    fields: [
                        {name: 'nome', label: 'Nome', required: true},
                        {name: 'descricao', label: 'Descrição', type: 'textarea'},
                    ],
                    customContent: (
                        <>
                            <div style={{marginBottom: '20px'}}>
                                <h4>Tabela</h4>
                                <AutoComplete
                                    label="Adicionar Tabela"
                                    source={TABELA_SOURCE}
                                    searchKeys={TABELA_SEARCH}
                                    columns={TABELA_COLUMNS}
                                    onSelect={addTabela}
                                />
                                <DataTable
                                    data={tabelas}
                                    columns={TABELA_COLS}
                                    actions={[
                                        {key: 'remove', label: 'Remover', icon: 'minus', className: 'btnred', onClick: removeTabela},
                                    ]}
                                />
                            </div>
                            <div style={{marginBottom: '20px'}}>
                                <h4>Gráfico</h4>
                                <AutoComplete
                                    label="Adicionar Gráfico"
                                    source={GRAFICO_SOURCE}
                                    searchKeys={GRAFICO_SEARCH}
                                    columns={GRAFICO_COLUMNS}
                                    onSelect={addGrafico}
                                />
                                <DataTable
                                    data={graficos}
                                    columns={GRAFICO_COLS}
                                    actions={[
                                        {key: 'remove', label: 'Remover', icon: 'minus', className: 'btnred', onClick: removeGrafico},
                                    ]}
                                />
                            </div>
                            <div style={{marginBottom: '20px'}}>
                                <h4>Mapa</h4>
                                <AutoComplete
                                    label="Adicionar Mapa"
                                    source={MAPA_SOURCE}
                                    searchKeys={MAPA_SEARCH}
                                    columns={MAPA_COLUMNS}
                                    onSelect={addMapa}
                                />
                                <DataTable
                                    data={mapas}
                                    columns={MAPA_COLS}
                                    actions={[
                                        {key: 'remove', label: 'Remover', icon: 'minus', className: 'btnred', onClick: removeMapa},
                                    ]}
                                />
                            </div>
                            <div style={{marginBottom: '20px'}}>
                                <h4>Painéis do Dashboard</h4>
                                <div style={{display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap'}}>
                                    <AutoComplete
                                        label="Tabela"
                                        source={TABELA_SOURCE}
                                        searchKeys={TABELA_SEARCH}
                                        columns={TABELA_COLUMNS}
                                        style={{flex: 1, minWidth: '200px'}}
                                        onSelect={(item) => addPainel({tabelaId: item.id, ordem: painelPainels.length + 1})}
                                    />
                                    <AutoComplete
                                        label="Gráfico"
                                        source={GRAFICO_SOURCE}
                                        searchKeys={GRAFICO_SEARCH}
                                        columns={GRAFICO_COLUMNS}
                                        style={{flex: 1, minWidth: '200px'}}
                                        onSelect={(item) => addPainel({graficoId: item.id, ordem: painelPainels.length + 1})}
                                    />
                                    <AutoComplete
                                        label="Mapa"
                                        source={MAPA_SOURCE}
                                        searchKeys={MAPA_SEARCH}
                                        columns={MAPA_COLUMNS}
                                        style={{flex: 1, minWidth: '200px'}}
                                        onSelect={(item) => addPainel({mapaId: item.id, ordem: painelPainels.length + 1})}
                                    />
                                </div>
                                <DataTable
                                    data={painelPainels}
                                    columns={PAINEL_COLUMNS}
                                    actions={[
                                        {key: 'up', label: 'Subir', icon: 'arrow-up', className: 'btnblack', onClick: () => {}},
                                        {key: 'down', label: 'Descer', icon: 'arrow-down', className: 'btnbrown', onClick: () => {}},
                                        {key: 'remove', label: 'Remover', icon: 'minus', className: 'btnred', onClick: removePainel},
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
                    fields: [],
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
                                selectionMode="multiple"
                                selectedItems={filtroSelecionados}
                                onSelectionChange={setFiltroSelecionados}
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