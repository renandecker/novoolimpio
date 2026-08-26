import {useState, useEffect} from 'react';
import {PermissionGate} from '../permissions';
import {MasterDetail} from '../MasterDetail';
import {Tabs} from '../Tabs';
import {Wizard, useWizardData} from '../Wizard';
import {DataTable, type DataTableColumn} from '../DataTable';
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
    ORGANOGRAMA_TOPICO_SOURCE,
    ORGANOGRAMA_TOPICO_COLUMNS,
    ORGANOGRAMA_TOPICO_SEARCH,
} from '../masterDetailSources';
import type {ApiItem} from '../types';
import {useApi} from '../api';
import {FormLayout, FormTabConfig} from '../FormLayout';

const TABELA_COLS: DataTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'nome', label: 'Nome'},
];

const GRAFICO_COLS: DataTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'nome', label: 'Nome'},
    {key: 'tipo', label: 'Tipo'},
];

const MAPA_COLS: DataTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'nome', label: 'Nome'},
];

const TOPICO_COLUMNS: DataTableColumn[] = [
    {key: 'relatorioNome', label: 'Relatório', width: '60%'},
    {key: 'tipo', label: 'Tipo', width: '20%'},
    {key: 'ordem', label: 'Ordem', width: '50px'},
];

interface OrganogramaFormData {
    entity: {
        id?: number;
        nome?: string;
    };
    tabelas: any[];
    graficos: any[];
    mapas: any[];
    organogramaTopicos: any[];
    usuarios: ApiItem[];
    unidades: ApiItem[];
    perfis: ApiItem[];
    filtros: any[];
}

export default function ViewRelatoriosFormOrganogramaListScreen() {
    const [usuarios, setUsuarios] = useState<ApiItem[]>([]);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [perfis, setPerfis] = useState<ApiItem[]>([]);
    const [tabelas, setTabelas] = useState<any[]>([]);
    const [graficos, setGraficos] = useState<any[]>([]);
    const [mapas, setMapas] = useState<any[]>([]);
    const [organogramaTopicos, setOrganogramaTopicos] = useState<any[]>([]);
    const [filtros, setFiltros] = useState<any[]>([]);

    const {data, updateFields} = useWizardData<OrganogramaFormData>({
        entity: {},
        tabelas: [],
        graficos: [],
        mapas: [],
        organogramaTopicos: [],
        usuarios: [],
        unidades: [],
        perfis: [],
        filtros: [],
    });

    const {post: saveOrganograma} = useApi('/api/relatorios/organograma');
    const {get: loadTabelas} = useApi('/api/relatorios/tabela');
    const {get: loadGraficos} = useApi('/api/relatorios/grafico');
    const {get: loadMapas} = useApi('/api/relatorios/mapa');
    const {get: loadFiltros} = useApi('/api/relatorios/filtro');
    const {post: saveFiltro} = useApi('/api/relatorios/filtro');
    const {delete: deleteFiltro} = useApi('/api/relatorios/filtro');
    const {post: saveTopico} = useApi('/api/relatorios/organograma-topico');
    const {delete: deleteTopico} = useApi('/api/relatorios/organograma-topico');

    const [entity, setEntity] = useState({nome: ''});
    const [filtroSelecionados, setFiltroSelecionados] = useState<any[]>([]);

    const addTabela = (item: ApiItem) => {
        if (!tabelas.find(t => t.id === item.id)) {
            setTabelas([...tabelas, item]);
            updateFields({tabelas: [...tabelas, item]});
        }
    };

    const removeTabela = (item: any) => {
        setTabelas(tabelas.filter(t => t.id !== item.id));
        updateFields({tabelas: tabelas.filter(t => t.id !== item.id)});
    };

    const addGrafico = (item: ApiItem) => {
        if (!graficos.find(g => g.id === item.id)) {
            setGraficos([...graficos, item]);
            updateFields({graficos: [...graficos, item]});
        }
    };

    const removeGrafico = (item: any) => {
        setGraficos(graficos.filter(g => g.id !== item.id));
        updateFields({graficos: graficos.filter(g => g.id !== item.id)});
    };

    const addMapa = (item: ApiItem) => {
        if (!mapas.find(m => m.id === item.id)) {
            setMapas([...mapas, item]);
            updateFields({mapas: [...mapas, item]});
        }
    };

    const removeMapa = (item: any) => {
        setMapas(mapas.filter(m => m.id !== item.id));
        updateFields({mapas: mapas.filter(m => m.id !== item.id)});
    };

    const addTopico = async (topico: {tabelaId?: number; graficoId?: number; mapaId?: number; ordem: number}) => {
        try {
            const resp = await saveTopico({
                organogramaId: data.entity.id,
                ...topico,
            });
            setOrganogramaTopicos([...organogramaTopicos, resp.data]);
            updateFields({organogramaTopicos: [...organogramaTopicos, resp.data]});
        } catch (error) {
            console.error('Erro ao adicionar tópico:', error);
            alert('Erro ao adicionar tópico');
        }
    };

    const removeTopico = async (topico: any) => {
        try {
            await deleteTopico(topico.id);
            setOrganogramaTopicos(organogramaTopicos.filter(t => t.id !== topico.id));
            updateFields({organogramaTopicos: organogramaTopicos.filter(t => t.id !== topico.id)});
        } catch (error) {
            console.error('Erro ao remover tópico:', error);
            alert('Erro ao remover tópico');
        }
    };

    const handleComplete = async (formData: OrganogramaFormData) => {
        try {
            await saveOrganograma({
                ...formData.entity,
                usuarios: formData.usuarios,
                unidades: formData.unidades,
                perfis: formData.perfis,
                tabelas: formData.tabelas,
                graficos: formData.graficos,
                mapas: formData.mapas,
                organogramaTopicos: formData.organogramaTopicos,
                filtros: formData.filtros,
            });
            alert('Organograma salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar organograma:', error);
            alert('Erro ao salvar organograma');
        }
    };

    const addFiltro = async () => {
        // Filtro selection is handled by checkboxes in the DataTable
        updateFields({filtros: filtroSelecionados});
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <div className="div_form">
                    <div className="form-title">Cadastro / Edição de Relatório de Organograma</div>
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
                                                title="Configuração"
                                                tabs={[
                                                    {
                                                        key: 'principal',
                                                        label: 'Principal',
                                                        fields: [
                                                            {name: 'nome', label: 'Nome', required: true, span: 4},
                                                        ],
                                                    },
                                                ]}
                                                initialValues={data.entity}
                                                onSubmit={(vals) => setEntity({...data.entity, ...vals})}
                                                onCancel={() => {}}
                                                submitLabel=""
                                                cancelLabel=""
                                            />
                                            <div style={{marginTop: '20px'}}>
                                                <Tabs tabs={[
                                                    {
                                                        key: 'tabela',
                                                        label: 'Tabela',
                                                        content: (
                                                            <div>
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
                                                                        {key: 'remove', label: 'Remover', icon: 'minus', className: 'btnblue', onClick: removeTabela},
                                                                    ]}
                                                                />
                                                            </div>
                                                        ),
                                                    },
                                                    {
                                                        key: 'grafico',
                                                        label: 'Gráfico',
                                                        content: (
                                                            <div>
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
                                                                        {key: 'remove', label: 'Remover', icon: 'minus', className: 'btnblue', onClick: removeGrafico},
                                                                    ]}
                                                                />
                                                            </div>
                                                        ),
                                                    },
                                                    {
                                                        key: 'mapa',
                                                        label: 'Mapa',
                                                        content: (
                                                            <div>
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
                                                                        {key: 'remove', label: 'Remover', icon: 'minus', className: 'btnblue', onClick: removeMapa},
                                                                    ]}
                                                                />
                                                            </div>
                                                        ),
                                                    },
                                                ]} />
                                            </div>
                                            <div style={{marginTop: '20px'}}>
                                                <h4>Tópicos do Organograma</h4>
                                                <div style={{display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap'}}>
                                                    <AutoComplete
                                                        label="Tabela"
                                                        source={TABELA_SOURCE}
                                                        searchKeys={TABELA_SEARCH}
                                                        columns={TABELA_COLUMNS}
                                                        style={{flex: 1, minWidth: '200px'}}
                                                        onSelect={(item) => addTopico({tabelaId: item.id, ordem: organogramaTopicos.length + 1})}
                                                    />
                                                    <AutoComplete
                                                        label="Gráfico"
                                                        source={GRAFICO_SOURCE}
                                                        searchKeys={GRAFICO_SEARCH}
                                                        columns={GRAFICO_COLUMNS}
                                                        style={{flex: 1, minWidth: '200px'}}
                                                        onSelect={(item) => addTopico({graficoId: item.id, ordem: organogramaTopicos.length + 1})}
                                                    />
                                                    <AutoComplete
                                                        label="Mapa"
                                                        source={MAPA_SOURCE}
                                                        searchKeys={MAPA_SEARCH}
                                                        columns={MAPA_COLUMNS}
                                                        style={{flex: 1, minWidth: '200px'}}
                                                        onSelect={(item) => addTopico({mapaId: item.id, ordem: organogramaTopicos.length + 1})}
                                                    />
                                                </div>
                                                <DataTable
                                                    data={organogramaTopicos}
                                                    columns={TOPICO_COLUMNS}
                                                    actions={[
                                                        {key: 'up', label: 'Subir', icon: 'arrow-up', className: 'btnblack', onClick: () => {}},
                                                        {key: 'down', label: 'Descer', icon: 'arrow-down', className: 'btnbrown', onClick: () => {}},
                                                        {key: 'remove', label: 'Remover', icon: 'minus', className: 'btnred', onClick: removeTopico},
                                                    ]}
                                                />
                                            </div>
                                        </div>
                                    ),
                                    validate: async (d) => (d.entity.nome && d.entity.nome.length >= 3) || 'Nome deve ter pelo menos 3 caracteres',
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
                                    key: 'filtros',
                                    label: 'Filtros',
                                    content: (
                                        <div>
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
                                        </div>
                                    ),
                                    nextLabel: 'Concluir',
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