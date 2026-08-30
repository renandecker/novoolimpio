import {useState, useEffect} from 'react';
import {PermissionGate} from '../../shared/services/permissions';
import {MasterDetail} from '../../shared/components/MasterDetail';
import {Tabs} from '../../shared/components/Tabs';
import {Wizard, useWizardData} from '../../shared/components/Wizard';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';
import {AutoComplete} from '../../shared/components/AutoComplete';
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
} from '../../shared/services/masterDetailSources';
import type {ApiItem} from '../../features/auth/types';
import {useApi} from '../../shared/services/api';
import {FormLayout, FormTabConfig} from '../../shared/components/FormLayout';

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

const PAINEL_COLUMNS: DataTableColumn[] = [
    {key: 'relatorioNome', label: 'RelatÃ³rio', width: '60%'},
    {key: 'tipo', label: 'Tipo', width: '20%'},
    {key: 'ordem', label: 'Ordem', width: '50px'},
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

    const {data, updateFields} = useWizardData<DashboardFormData>({
        entity: {},
        tabelas: [],
        graficos: [],
        mapas: [],
        painelPainels: [],
        usuarios: [],
        unidades: [],
        perfis: [],
        filtros: [],
    });

    const {post: saveDashboard} = useApi('/api/relatorios/dashboard');
    const {get: loadTabelas} = useApi('/api/relatorios/tabela');
    const {get: loadGraficos} = useApi('/api/relatorios/grafico');
    const {get: loadMapas} = useApi('/api/relatorios/mapa');
    const {get: loadFiltros} = useApi('/api/relatorios/filtro');
    const {post: saveFiltro} = useApi('/api/relatorios/filtro');
    const {delete: deleteFiltro} = useApi('/api/relatorios/filtro');
    const {post: savePainel} = useApi('/api/relatorios/painel-painel');
    const {delete: deletePainel} = useApi('/api/relatorios/painel-painel');

    const [entity, setEntity] = useState({nome: '', descricao: ''});

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

    const addPainel = async (painel: {tabelaId?: number; graficoId?: number; mapaId?: number; ordem: number}) => {
        try {
            const resp = await savePainel({
                painelId: data.entity.id,
                ...painel,
            });
            setPainelPainels([...painelPainels, resp.data]);
            updateFields({painelPainels: [...painelPainels, resp.data]});
        } catch (error) {
            console.error('Erro ao adicionar painel:', error);
            alert('Erro ao adicionar painel');
        }
    };

    const removePainel = async (painel: any) => {
        try {
            await deletePainel(painel.id);
            setPainelPainels(painelPainels.filter(p => p.id !== painel.id));
            updateFields({painelPainels: painelPainels.filter(p => p.id !== painel.id)});
        } catch (error) {
            console.error('Erro ao remover painel:', error);
            alert('Erro ao remover painel');
        }
    };

    const handleComplete = async (formData: DashboardFormData) => {
        try {
            await saveDashboard({
                ...formData.entity,
                usuarios: formData.usuarios,
                unidades: formData.unidades,
                perfis: formData.perfis,
                tabelas: formData.tabelas,
                graficos: formData.graficos,
                mapas: formData.mapas,
                painelPainels: formData.painelPainels,
                filtros: formData.filtros,
            });
            alert('Dashboard salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar dashboard:', error);
            alert('Erro ao salvar dashboard');
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <div className="div_form">
                    <div className="form-title">Cadastro / EdiÃ§Ã£o de RelatÃ³rio de Dashboard</div>
                    <div className="table_form">
                        <Wizard
                            initialData={data}
                            onDataChange={updateFields}
                            steps={[
                                {
                                    key: 'definicao',
                                    label: 'DefiniÃ§Ã£o',
                                    content: (
                                        <div>
                                            <FormLayout
                                                title="ConfiguraÃ§Ã£o"
                                                tabs={[
                                                    {
                                                        key: 'principal',
                                                        label: 'Principal',
                                                        fields: [
                                                            {name: 'nome', label: 'Nome', required: true, span: 4},
                                                            {name: 'descricao', label: 'DescriÃ§Ã£o', type: 'textarea', span: 4},
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
                                                        label: 'GrÃ¡fico',
                                                        content: (
                                                            <div>
                                                                <AutoComplete
                                                                    label="Adicionar GrÃ¡fico"
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
                                                <h4>PainÃ©is do Dashboard</h4>
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
                                                        label="GrÃ¡fico"
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
                                        </div>
                                    ),
                                    validate: async (d) => (d.entity.nome && d.entity.nome.length >= 3) || 'Nome deve ter pelo menos 3 caracteres',
                                },
                                {
                                    key: 'permissao',
                                    label: 'PermissÃ£o',
                                    content: (
                                        <div>
                                            <div style={{marginBottom: '20px'}}>
                                                <h3>UsuÃ¡rios</h3>
                                                <MasterDetail
                                                    label="UsuÃ¡rio"
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
                                                    {key: 'dimensaoNome', label: 'DimensÃ£o'},
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
