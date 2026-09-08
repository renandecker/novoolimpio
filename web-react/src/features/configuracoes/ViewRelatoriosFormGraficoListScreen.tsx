import {useState, useEffect} from 'react';
import {useSearchParams, useNavigate} from 'react-router-dom';
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
import {useApi, api} from '../../shared/services/api';
import {API_PATHS} from '../../shared/services/apiPaths';
import {FormLayout, FormTabConfig} from '../../shared/components/FormLayout';

const TIPO_GRAFICO_OPTIONS = [
    {value: 'BARRA_VERTICAL', label: 'Barra Vertical'},
    {value: 'BARRA_HORIZONTAL', label: 'Barra Horizontal'},
    {value: 'LINHAS', label: 'Linhas'},
    {value: 'PIZZA', label: 'Pizza'},
    {value: 'CIRCULAR', label: 'Circular'},
    {value: 'COMBINADO', label: 'Combinado'},
];

const TIPO_ORDEM_OPTIONS = [
    {value: 'CRESCENTE', label: 'Crescente'},
    {value: 'DECRESCENTE', label: 'Decrescente'},
    {value: 'NENHUMA', label: 'Nenhuma'},
];

const POSICAO_LEGENDA_OPTIONS = [
    {value: 'w', label: 'Esquerda'},
    {value: 'e', label: 'Direita'},
    {value: 'ne', label: 'Superior Direito'},
    {value: 'se', label: 'Inferior Direito'},
];

const FORMATO_DATA_OPTIONS = [
    {value: 'DATA', label: 'Data'},
    {value: 'DIARIO', label: 'Diário'},
    {value: 'SEMANAL', label: 'Semanal'},
    {value: 'MENSAL', label: 'Mensal'},
    {value: 'TRIMESTRAL', label: 'Trimestral'},
    {value: 'SEMESTRAL', label: 'Semestral'},
    {value: 'ANUAL', label: 'Anual'},
    {value: 'DIARIO/ANUAL', label: 'Diário / Anual'},
    {value: 'SEMANAL/ANUAL', label: 'Semanal / Anual'},
    {value: 'MENSAL/ANUAL', label: 'Mensal / Anual'},
    {value: 'TRIMESTRAL/ANUAL', label: 'Trimestral / Anual'},
    {value: 'SEMESTRAL/ANUAL', label: 'Semestral / Anual'},
];

const GRAFICO_EIXO_COLUMNS: DataTableColumn[] = [
    {key: 'dimensaoNome', label: 'Dimensão Informação', width: '30%'},
    {key: 'dimensaoTipo', label: 'Dimensão Tipo', width: '20%'},
    {key: 'medidaNome', label: 'Medida Informação', width: '30%'},
    {key: 'medidaTipo', label: 'Medida Tipo', width: '20%'},
];

interface GraficoFormData {
    entity: {
        id?: number;
        nome?: string;
        estruturaId?: number;
        tipo?: string;
        ordemGrafico?: string;
        limite?: number;
        tipoEixo?: number;
        dimensaoReferenciaId?: number;
        medidaInformacaoId?: number;
        dimensaoCombinadoId?: number;
        medidaCombinadoId?: number;
        exibirValor?: boolean;
        exibirLegenda?: boolean;
        exibirPercentual?: boolean;
        valorAcumulado?: boolean;
        posicao?: string;
        colunaLegenda?: number;
        coluna?: number;
        altura?: number;
        diametro?: number;
        margem?: number;
        formatoData?: string;
    };
    graficoEixos: any[];
    usuarios: ApiItem[];
    unidades: ApiItem[];
    perfis: ApiItem[];
    filtros: any[];
}

export default function ViewRelatoriosFormGraficoListScreen() {
    const [usuarios, setUsuarios] = useState<ApiItem[]>([]);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [perfis, setPerfis] = useState<ApiItem[]>([]);
    const [graficoEixos, setGraficoEixos] = useState<any[]>([]);
    const [filtros, setFiltros] = useState<any[]>([]);
    const [estruturaSelecionada, setEstruturaSelecionada] = useState<ApiItem | null>(null);

    const {data, updateFields} = useWizardData<GraficoFormData>({
        entity: {
            tipo: 'BARRA_VERTICAL',
            ordemGrafico: 'NENHUMA',
            limite: 10,
            tipoEixo: 0,
            exibirValor: true,
            exibirLegenda: true,
            exibirPercentual: false,
            valorAcumulado: false,
            posicao: 'e',
            colunaLegenda: 1,
            coluna: 1,
            altura: 400,
        },
        graficoEixos: [],
        usuarios: [],
        unidades: [],
        perfis: [],
        filtros: [],
    });

    const {post: saveGrafico} = useApi(API_PATHS.relatorios.grafico);
    const {put: updateGrafico} = useApi(API_PATHS.relatorios.grafico);
    const loadGraficoPorId = async (id: number) => (await api.get(`${API_PATHS.relatorios.grafico}/${id}`)).data;
    const {get: loadEstrutura} = useApi(API_PATHS.relatorios.estrutura);
    const {get: loadDimensoes} = useApi(API_PATHS.relatorios.dimensao);
    const {get: loadMedidas} = useApi(API_PATHS.relatorios.medida);
    const {get: loadFiltros} = useApi(API_PATHS.relatorios.filtro);
    const {post: saveFiltro} = useApi(API_PATHS.relatorios.filtro);
    const {delete: deleteFiltro} = useApi(API_PATHS.relatorios.filtro);

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
            loadGraficoPorId(editingId)
                .then(async (grafico: any) => {
                    updateFields({entity: {...data.entity, ...grafico}});
                    if (grafico.estruturaId) await loadEstruturaPorId(grafico.estruturaId);
                })
                .catch((error) => console.error('Erro ao carregar gráfico:', error));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingId]);

    const loadEstruturaPorId = async (id: number) => {
        try {
            const estrutura = (await api.get(`${API_PATHS.relatorios.estrutura}/${id}`)).data;
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

    const handleTipoGraficoChange = (tipo: string) => {
        updateFields({entity: {...data.entity, tipo}});
    };

    const handleTipoEixoChange = (tipoEixo: number) => {
        updateFields({entity: {...data.entity, tipoEixo}});
        if (tipoEixo === 1) {
            // Clear single axis fields when switching to multi-eixo
            updateFields({
                entity: {
                    ...data.entity,
                    tipoEixo,
                    dimensaoReferenciaId: undefined,
                    medidaInformacaoId: undefined,
                    dimensaoCombinadoId: undefined,
                    medidaCombinadoId: undefined,
                }
            });
        }
    };

    const addEixo = (eixoData: any) => {
        const newEixos = [...graficoEixos, eixoData];
        setGraficoEixos(newEixos);
        updateFields({graficoEixos: newEixos});
    };

    const removeEixo = (eixo: any) => {
        const newEixos = graficoEixos.filter(e => e !== eixo);
        setGraficoEixos(newEixos);
        updateFields({graficoEixos: newEixos});
    };

    const handleComplete = async (formData: GraficoFormData) => {
        try {
            const payload = {
                nome: formData.entity.nome,
                estruturaId: formData.entity.estruturaId,
                tipo: formData.entity.tipo,
                ordemGrafico: formData.entity.ordemGrafico,
                limite: formData.entity.limite,
                tipoEixo: formData.entity.tipoEixo,
                formatoData: formData.entity.formatoData,
                posicao: formData.entity.posicao,
                colunaLegenda: formData.entity.colunaLegenda,
                coluna: formData.entity.coluna,
                altura: formData.entity.altura,
                diametro: formData.entity.diametro,
                margem: formData.entity.margem,
                exibirValor: formData.entity.exibirValor,
                exibirLegenda: formData.entity.exibirLegenda,
                exibirPercentual: formData.entity.exibirPercentual,
                valorAcumulado: formData.entity.valorAcumulado,
                dimensaoReferenciaId: formData.entity.dimensaoReferenciaId,
                medidaInformacaoId: formData.entity.medidaInformacaoId,
                dimensaoCombinadoId: formData.entity.dimensaoCombinadoId,
                medidaCombinadoId: formData.entity.medidaCombinadoId,
                todosUsuarios: formData.usuarios.length === 0,
                todosUnidades: formData.unidades.length === 0,
                todosPerfis: formData.perfis.length === 0,
            };
            if (editingId) {
                await updateGrafico(editingId, payload);
            } else {
                await saveGrafico(payload);
            }
            alert('Gráfico salvo com sucesso!');
            navigate('/view/relatorios/listGrafico');
        } catch (error) {
            console.error('Erro ao salvar gráfico:', error);
            alert('Erro ao salvar gráfico');
        }
    };

    // Filtros
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

    const isTipoEixoSimples = data.entity.tipoEixo === 0;
    const isCombinado = data.entity.tipo === 'COMBINADO';
    const isPizzaOuCircular = data.entity.tipo === 'PIZZA' || data.entity.tipo === 'CIRCULAR';
    const isBarra = data.entity.tipo === 'BARRA_HORIZONTAL' || data.entity.tipo === 'BARRA_VERTICAL';
    const showFormatoData = isTipoEixoSimples && (
        (data.entity.dimensaoReferenciaId && estruturaSelecionada) || 
        (data.entity.dimensaoCombinadoId && isCombinado)
    );

    return (
        <PermissionGate permission="READ">
            <main>
                <div className="div_form">
                    <div className="form-title">Cadastro / Edição de Relatório de Gráfico</div>
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
                                            <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
                                                {/* Left column */}
                                                <div style={{flex: 1, minWidth: '400px'}}>
                                                    <FormLayout
                                                        title="Configuração Principal"
                                                        tabs={[
                                                            {
                                                                key: 'principal',
                                                                label: 'Principal',
                                                                fields: [
                                                                    {name: 'nome', label: 'Nome', required: true, span: 3},
                                                                    {name: 'estruturaId', label: 'Estrutura', type: 'autoComplete', autoCompleteSource: ESTRUTURA_SOURCE, autoCompleteSearchKeys: ESTRUTURA_SEARCH, autoCompleteColumns: ESTRUTURA_COLUMNS, span: 3},
                                                                    {name: 'tipo', label: 'Tipo Gráfico', type: 'select', options: TIPO_GRAFICO_OPTIONS, required: true, onChange: handleTipoGraficoChange},
                                                                    {name: 'ordemGrafico', label: 'Ordenação', type: 'select', options: TIPO_ORDEM_OPTIONS},
                                                                    {name: 'limite', label: 'Limite Gráfico', type: 'number', min: 1, max: 50, help: 'Limite máximo de 50 registros para exibir no gráfico'},
                                                                    {name: 'tipoEixo', label: 'Tipo Eixo', type: 'select', options: [
                                                                        {value: '0', label: 'Simples'},
                                                                        {value: '1', label: 'Multi Eixo'},
                                                                    ], onChange: (v) => handleTipoEixoChange(parseInt(v as string))},
                                                                ],
                                                            },
                                                            {
                                                                key: 'eixoSimples',
                                                                label: 'Eixo Simples',
                                                                fields: [
                                                                    {name: 'dimensaoReferenciaId', label: 'Dimensão Referência', type: 'autoComplete', autoCompleteSource: DIMENSAO_SOURCE, autoCompleteSearchKeys: DIMENSAO_SEARCH, autoCompleteColumns: DIMENSAO_COLUMNS, filterParams: {estruturaId: data.entity.estruturaId}},
                                                                    {name: 'medidaInformacaoId', label: 'Medida Informação', type: 'autoComplete', autoCompleteSource: MEDIDA_SOURCE, autoCompleteSearchKeys: MEDIDA_SEARCH, autoCompleteColumns: MEDIDA_COLUMNS, filterParams: {estruturaId: data.entity.estruturaId}},
                                                                    {name: 'dimensaoCombinadoId', label: 'Dimensão Combinado', type: 'autoComplete', autoCompleteSource: DIMENSAO_SOURCE, autoCompleteSearchKeys: DIMENSAO_SEARCH, autoCompleteColumns: DIMENSAO_COLUMNS, filterParams: {estruturaId: data.entity.estruturaId}, conditional: isCombinado},
                                                                    {name: 'medidaCombinadoId', label: 'Medida Combinado', type: 'autoComplete', autoCompleteSource: MEDIDA_SOURCE, autoCompleteSearchKeys: MEDIDA_SEARCH, autoCompleteColumns: MEDIDA_COLUMNS, filterParams: {estruturaId: data.entity.estruturaId}, conditional: isCombinado},
                                                                    {name: 'exibirValor', label: 'Exibir Valor', type: 'boolean', booleanLabels: {on: 'Sim', off: 'Não'}},
                                                                    {name: 'exibirLegenda', label: 'Exibir Legenda', type: 'boolean', booleanLabels: {on: 'Sim', off: 'Não'}},
                                                                    {name: 'exibirPercentual', label: 'Exibir Percentual', type: 'boolean', booleanLabels: {on: 'Sim', off: 'Não'}, conditional: isPizzaOuCircular},
                                                                    {name: 'valorAcumulado', label: 'Acumulado', type: 'boolean', booleanLabels: {on: 'Sim', off: 'Não'}, conditional: isBarra},
                                                                    {name: 'posicao', label: 'Posição Legenda', type: 'select', options: POSICAO_LEGENDA_OPTIONS, conditional: data.entity.exibirLegenda},
                                                                    {name: 'colunaLegenda', label: 'Coluna Legenda', type: 'number', conditional: data.entity.exibirLegenda},
                                                                    {name: 'coluna', label: 'Coluna Gráfico', type: 'number', conditional: isPizzaOuCircular},
                                                                    {name: 'altura', label: 'Altura Gráfico', type: 'number'},
                                                                    {name: 'diametro', label: 'Diâmetro', type: 'number', conditional: data.entity.tipo === 'PIZZA'},
                                                                    {name: 'margem', label: 'Margem Separação', type: 'number', conditional: data.entity.tipo === 'CIRCULAR'},
                                                                    {name: 'formatoData', label: 'Formato Data', type: 'select', options: FORMATO_DATA_OPTIONS, conditional: showFormatoData},
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
                                                {/* Right column - Eixos when multi-eixo */}
                                                <div style={{flex: 1, minWidth: '400px'}} conditional={data.entity.tipoEixo === 1 && !isCombinado}>
                                                    <h3>Eixos do Gráfico</h3>
                                                    <div style={{marginBottom: '15px'}}>
                                                        <AutoComplete
                                                            label="Dimensão Informação"
                                                            source={DIMENSAO_SOURCE}
                                                            searchKeys={DIMENSAO_SEARCH}
                                                            columns={DIMENSAO_COLUMNS}
                                                            filterParams={{estruturaId: data.entity.estruturaId}}
                                                        />
                                                        <AutoComplete
                                                            label="Medida Informação"
                                                            source={MEDIDA_SOURCE}
                                                            searchKeys={MEDIDA_SEARCH}
                                                            columns={MEDIDA_COLUMNS}
                                                            filterParams={{estruturaId: data.entity.estruturaId}}
                                                        />
                                                        <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                                                            <select className="form-input form-select" style={{width: '200px'}}>
                                                                {TIPO_GRAFICO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                            </select>
                                                            <button className="btn-form-save" onClick={() => {}}>Adicionar Eixo</button>
                                                        </div>
                                                    </div>
                                                    <DataTable
                                                        data={graficoEixos}
                                                        columns={GRAFICO_EIXO_COLUMNS}
                                                        actions={[
                                                            {key: 'remove', label: 'Remover', icon: 'minus', className: 'btnred', onClick: removeEixo},
                                                        ]}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                    validate: async (d) => {
                                        if (!d.entity.nome || d.entity.nome.length < 3) return 'Nome deve ter pelo menos 3 caracteres';
                                        if (!d.entity.estruturaId) return 'Selecione uma estrutura';
                                        if (isTipoEixoSimples && !d.entity.dimensaoReferenciaId) return 'Selecione a dimensão de referência';
                                        if (isTipoEixoSimples && !d.entity.medidaInformacaoId) return 'Selecione a medida de informação';
                                        if (isCombinado && (!d.entity.dimensaoCombinadoId || !d.entity.medidaCombinadoId)) return 'Para tipo Combinado, selecione dimensão e medida combinados';
                                        return true;
                                    },
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
