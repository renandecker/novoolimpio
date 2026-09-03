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
} from '../../shared/services/masterDetailSources';
import type {ApiItem} from '../../features/auth/types';
import {useApi} from '../../shared/services/api';
import {API_PATHS} from '../../shared/services/apiPaths';
import {FormLayout, FormTabConfig} from '../../shared/components/FormLayout';

const TABELA_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'nome', label: 'Nome'},
    {key: 'estruturaId', label: 'Estrutura'},
];

const DIMENSAO_DESC_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'nomeVisualizacao', label: 'Dimensão Descritiva'},
];

const DIMENSAO_TEMPO_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'nomeVisualizacao', label: 'Dimensão Tempo'},
];

const MEDIDA_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'nomeVisualizacao', label: 'Medida'},
];

const TABELA_COLUNAS_COLUMNS: DataTableColumn[] = [
    {key: 'dimensaoNome', label: 'Dimensão', width: '30%'},
    {key: 'medidaNome', label: 'Medida', width: '30%'},
    {key: 'dimensaoTipo', label: 'Tipo Dimensão', width: '20%'},
    {key: 'medidaTipo', label: 'Tipo Medida', width: '20%'},
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
    tabelaColunas: any[];
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
    const [tabelaColunas, setTabelaColunas] = useState<any[]>([]);
    const [filtros, setFiltros] = useState<any[]>([]);
    const [estruturaSelecionada, setEstruturaSelecionada] = useState<ApiItem | null>(null);

    const {data, updateFields} = useWizardData<TabelaFormData>({
        entity: {},
        dimensoesDescritivas: [],
        dimensoesTempo: [],
        medidas: [],
        tabelaColunas: [],
        usuarios: [],
        unidades: [],
        perfis: [],
        filtros: [],
    });

    const {post: saveTabela} = useApi(API_PATHS.relatorios.tabela);
    const {get: loadEstrutura} = useApi(API_PATHS.relatorios.estrutura);
    const {get: loadDimensoes} = useApi(API_PATHS.relatorios.dimensao);
    const {get: loadMedidas} = useApi(API_PATHS.relatorios.medida);
    const {get: loadFiltros} = useApi(API_PATHS.relatorios.filtro);
    const {post: saveFiltro} = useApi(API_PATHS.relatorios.filtro);
    const {delete: deleteFiltro} = useApi(API_PATHS.relatorios.filtro);

    useEffect(() => {
        if (data.entity.estruturaId && data.entity.estruturaId !== estruturaSelecionada?.id) {
            loadEstruturaPorId(data.entity.estruturaId);
        }
    }, [data.entity.estruturaId]);

    const loadEstruturaPorId = async (id: number) => {
        try {
            const resp = await loadEstrutura(id);
            const estrutura = resp.data;
            setEstruturaSelecionada(estrutura);
            // Load dimensoes and medidas for this estrutura
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
        updateFields({entity: {...data.entity, estruturaId: item.id}});
        setEstruturaSelecionada(item);
        loadEstruturaPorId(item.id);
    };

    const addDimensaoDescritiva = (item: ApiItem) => {
        if (!dimensoesDescritivas.find(d => d.id === item.id)) {
            setDimensoesDescritivas([...dimensoesDescritivas, item]);
            updateFields({dimensoesDescritivas: [...dimensoesDescritivas, item]});
        }
    };

    const removeDimensaoDescritiva = (item: any) => {
        const newList = dimensoesDescritivas.filter(d => d.id !== item.id);
        setDimensoesDescritivas(newList);
        updateFields({dimensoesDescritivas: newList});
    };

    const addDimensaoTempo = (item: ApiItem) => {
        if (!dimensoesTempo.find(d => d.id === item.id)) {
            setDimensoesTempo([...dimensoesTempo, item]);
            updateFields({dimensoesTempo: [...dimensoesTempo, item]});
        }
    };

    const removeDimensaoTempo = (item: any) => {
        const newList = dimensoesTempo.filter(d => d.id !== item.id);
        setDimensoesTempo(newList);
        updateFields({dimensoesTempo: newList});
    };

    const addMedida = (item: ApiItem) => {
        if (!medidas.find(m => m.id === item.id)) {
            setMedidas([...medidas, item]);
            updateFields({medidas: [...medidas, item]});
        }
    };

    const removeMedida = (item: any) => {
        const newList = medidas.filter(m => m.id !== item.id);
        setMedidas(newList);
        updateFields({medidas: newList});
    };

    const handleComplete = async (formData: TabelaFormData) => {
        try {
            await saveTabela({
                ...formData.entity,
                usuarios: formData.usuarios,
                unidades: formData.unidades,
                perfis: formData.perfis,
                dimensoesDescritivas: formData.dimensoesDescritivas,
                dimensoesTempo: formData.dimensoesTempo,
                medidas: formData.medidas,
                tabelaColunas: formData.tabelaColunas,
                filtros: formData.filtros,
            });
            alert('Tabela salva com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar tabela:', error);
            alert('Erro ao salvar tabela');
        }
    };

    // Filtros tab content
    const [filtroNome, setFiltroNome] = useState('');
    const [filtroDimensao, setFiltroDimensao] = useState<ApiItem | null>(null);

    const addFiltro = async () => {
        if (!filtroNome.trim() || !filtroDimensao) {
            alert('Informe nome e dimensão para o filtro');
            return;
        }
        try {
            const resp = await saveFiltro({
                nome: filtroNome,
                dimensaoId: filtroDimensao.id,
                estruturaId: data.entity.estruturaId,
            });
            const newFiltro = resp.data;
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

    const definicaoTabs: FormTabConfig[] = [
        {
            key: 'principal',
            label: 'Principal',
            fields: [
                {name: 'nome', label: 'Nome', required: true, span: 3},
                {name: 'estruturaId', label: 'Estrutura', type: 'autoComplete', autoCompleteSource: ESTRUTURA_SOURCE, autoCompleteSearchKeys: ESTRUTURA_SEARCH, autoCompleteColumns: ESTRUTURA_COLUMNS, span: 3},
            ],
        },
    ];

    return (
        <PermissionGate permission="READ">
            <main>
                <div className="div_form">
                    <div className="form-title">Cadastro / Edição de Relatório de Tabela</div>
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
                                                title="Definição"
                                                tabs={definicaoTabs}
                                                initialValues={data.entity}
                                                onSubmit={(vals) => updateFields({entity: {...data.entity, ...vals}})}
                                                onCancel={() => {}}
                                                submitLabel=""
                                                cancelLabel=""
                                            />
                                            <div style={{marginTop: '20px'}}>
                                                <Tabs tabs={[
                                                    {
                                                        key: 'descritiva',
                                                        label: 'Dimensão Descritiva',
                                                        content: (
                                                            <div>
                                                                <AutoComplete
                                                                    label="Adicionar Dimensão Descritiva"
                                                                    source={DIMENSAO_SOURCE}
                                                                    searchKeys={DIMENSAO_SEARCH}
                                                                    columns={DIMENSAO_COLUMNS}
                                                                    value={null}
                                                                    onSelect={addDimensaoDescritiva}
                                                                    filterParams={{estruturaId: data.entity.estruturaId, tipoInfo: 'DESCRITIVA'}}
                                                                />
                                                                <DataTable
                                                                    data={dimensoesDescritivas}
                                                                    columns={DIMENSAO_DESC_COLUMNS}
                                                                    actions={[
                                                                        {key: 'info', label: 'Info', icon: 'info', className: 'btnyellow', onClick: (item) => alert('Consulta dados: ' + item.nomeVisualizacao)},
                                                                        {key: 'remove', label: 'Remover', icon: 'minus', className: 'btnblue', onClick: removeDimensaoDescritiva},
                                                                    ]}
                                                                />
                                                            </div>
                                                        ),
                                                    },
                                                    {
                                                        key: 'tempo',
                                                        label: 'Dimensão Tempo',
                                                        content: (
                                                            <div>
                                                                <AutoComplete
                                                                    label="Adicionar Dimensão Tempo"
                                                                    source={DIMENSAO_SOURCE}
                                                                    searchKeys={DIMENSAO_SEARCH}
                                                                    columns={DIMENSAO_COLUMNS}
                                                                    value={null}
                                                                    onSelect={addDimensaoTempo}
                                                                    filterParams={{estruturaId: data.entity.estruturaId, tipoInfo: 'TEMPO'}}
                                                                />
                                                                <DataTable
                                                                    data={dimensoesTempo}
                                                                    columns={DIMENSAO_TEMPO_COLUMNS}
                                                                    actions={[
                                                                        {key: 'remove', label: 'Remover', icon: 'minus', className: 'btnblue', onClick: removeDimensaoTempo},
                                                                    ]}
                                                                />
                                                            </div>
                                                        ),
                                                    },
                                                    {
                                                        key: 'medidas',
                                                        label: 'Medidas',
                                                        content: (
                                                            <div>
                                                                <AutoComplete
                                                                    label="Adicionar Medida"
                                                                    source={MEDIDA_SOURCE}
                                                                    searchKeys={MEDIDA_SEARCH}
                                                                    columns={MEDIDA_COLUMNS}
                                                                    value={null}
                                                                    onSelect={addMedida}
                                                                    filterParams={{estruturaId: data.entity.estruturaId}}
                                                                />
                                                                <DataTable
                                                                    data={medidas}
                                                                    columns={MEDIDA_COLUMNS}
                                                                    actions={[
                                                                        {key: 'remove', label: 'Remover', icon: 'minus', className: 'btnblue', onClick: removeMedida},
                                                                    ]}
                                                                />
                                                            </div>
                                                        ),
                                                    },
                                                    {
                                                        key: 'colunas',
                                                        label: 'Colunas da Tabela',
                                                        content: (
                                                            <div>
                                                                <p className="master-detail-empty">Configuração de colunas (dimensão + medida + ordem)</p>
                                                                <DataTable
                                                                    data={tabelaColunas}
                                                                    columns={TABELA_COLUNAS_COLUMNS}
                                                                    actions={[
                                                                        {key: 'up', label: 'Subir', icon: 'arrow-up', className: 'btnblack', onClick: () => {}},
                                                                        {key: 'down', label: 'Descer', icon: 'arrow-down', className: 'btnbrown', onClick: () => {}},
                                                                        {key: 'remove', label: 'Remover', icon: 'minus', className: 'btnred', onClick: () => {}},
                                                                    ]}
                                                                />
                                                            </div>
                                                        ),
                                                    },
                                                ]} />
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
                                                        // dimensao handled by autocomplete
                                                    }}
                                                    onCancel={() => {}}
                                                    submitLabel="Adicionar Filtro"
                                                    cancelLabel=""
                                                />
                                            </div>
                                            <DataTable
                                                data={filtros}
                                                columns={[
                                                    {key: 'id', label: 'ID', width: '80px'},
                                                    {key: 'nome', label: 'Nome'},
                                                    {key: 'estruturaNome', label: 'Estrutura'},
                                                    {key: 'dimensaoNome', label: 'Dimensão'},
                                                ]}
                                                actions={[
                                                    {key: 'remove', label: 'Remover', icon: 'trash', className: 'btnred', onClick: removeFiltro},
                                                ]}
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
