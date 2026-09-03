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
    const [estruturaSelecionada, setEstruturaSelecionada] = useState<any>(null);

    const {post: saveGrafico} = useApi(API_PATHS.relatorios.grafico);
    const {get: loadEstrutura} = useApi(API_PATHS.relatorios.estrutura);
    const {get: loadFiltros} = useApi(API_PATHS.relatorios.filtro);
    const {post: saveFiltro} = useApi(API_PATHS.relatorios.filtro);
    const {delete: deleteFiltro} = useApi(API_PATHS.relatorios.filtro);

    const [entity, setEntity] = useState({
        nome: '',
        estruturaId: undefined,
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
    });
    const [filtroNome, setFiltroNome] = useState('');
    const [filtroDimensao, setFiltroDimensao] = useState<any>(null);

    useEffect(() => {
        if (entity.estruturaId && entity.estruturaId !== estruturaSelecionada?.id) {
            loadEstrutura(entity.estruturaId).then(resp => setEstruturaSelecionada(resp.data));
        }
    }, [entity.estruturaId]);

    const handleTipoGraficoChange = (tipo: string) => {
        setEntity({...entity, tipo});
    };

    const handleTipoEixoChange = (tipoEixo: number) => {
        setEntity({...entity, tipoEixo});
    };

    const addEixo = (eixoData: any) => {
        setGraficoEixos([...graficoEixos, eixoData]);
    };

    const removeEixo = (eixo: any) => {
        setGraficoEixos(graficoEixos.filter(e => e !== eixo));
    };

    const handleSubmit = async () => {
        if (!entity.nome || entity.nome.length < 3) {
            alert('Nome deve ter pelo menos 3 caracteres');
            return;
        }
        if (!entity.estruturaId) {
            alert('Selecione uma estrutura');
            return;
        }
        if (entity.tipoEixo === 0 && !entity.dimensaoReferenciaId) {
            alert('Selecione a dimensão de referência');
            return;
        }
        if (entity.tipoEixo === 0 && !entity.medidaInformacaoId) {
            alert('Selecione a medida de informação');
            return;
        }
        if (entity.tipo === 'COMBINADO' && (!entity.dimensaoCombinadoId || !entity.medidaCombinadoId)) {
            alert('Para tipo Combinado, selecione dimensão e medida combinados');
            return;
        }
        try {
            await saveGrafico({
                ...entity,
                usuarios,
                unidades,
                perfis,
                graficoEixos,
                filtros,
            });
            alert('Gráfico salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar gráfico:', error);
            alert('Erro ao salvar gráfico');
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

    const isTipoEixoSimples = entity.tipoEixo === 0;
    const isCombinado = entity.tipo === 'COMBINADO';
    const isPizzaOuCircular = entity.tipo === 'PIZZA' || entity.tipo === 'CIRCULAR';
    const isBarra = entity.tipo === 'BARRA_HORIZONTAL' || entity.tipo === 'BARRA_VERTICAL';

    return (
        <FormLayout
            title="Cadastro / Edição de Relatório de Gráfico"
            tabs={[
                {
                    key: 'definicao',
                    label: 'Definição',
                    fields: [
                        {name: 'nome', label: 'Nome', required: true},
                        {name: 'estruturaId', label: 'Estrutura', type: 'autoComplete', autoCompleteSource: ESTRUTURA_SOURCE, autoCompleteSearchKeys: ESTRUTURA_SEARCH, autoCompleteColumns: ESTRUTURA_COLUMNS},
                        {name: 'tipo', label: 'Tipo Gráfico', type: 'select', options: TIPO_GRAFICO_OPTIONS, required: true, onChange: handleTipoGraficoChange},
                        {name: 'ordemGrafico', label: 'Ordenação', type: 'select', options: TIPO_ORDEM_OPTIONS},
                        {name: 'limite', label: 'Limite Gráfico', type: 'number', min: 1, max: 50, help: 'Máximo 50 registros'},
                        {name: 'tipoEixo', label: 'Tipo Eixo', type: 'select', options: [
                            {value: '0', label: 'Simples'},
                            {value: '1', label: 'Multi Eixo'},
                        ], onChange: (v) => handleTipoEixoChange(parseInt(v as string))},
                        {name: 'dimensaoReferenciaId', label: 'Dimensão Referência', type: 'autoComplete', autoCompleteSource: DIMENSAO_SOURCE, autoCompleteSearchKeys: DIMENSAO_SEARCH, autoCompleteColumns: DIMENSAO_COLUMNS, conditional: isTipoEixoSimples},
                        {name: 'medidaInformacaoId', label: 'Medida Informação', type: 'autoComplete', autoCompleteSource: MEDIDA_SOURCE, autoCompleteSearchKeys: MEDIDA_SEARCH, autoCompleteColumns: MEDIDA_COLUMNS, conditional: isTipoEixoSimples},
                        {name: 'dimensaoCombinadoId', label: 'Dimensão Combinado', type: 'autoComplete', autoCompleteSource: DIMENSAO_SOURCE, autoCompleteSearchKeys: DIMENSAO_SEARCH, autoCompleteColumns: DIMENSAO_COLUMNS, conditional: isCombinado},
                        {name: 'medidaCombinadoId', label: 'Medida Combinado', type: 'autoComplete', autoCompleteSource: MEDIDA_SOURCE, autoCompleteSearchKeys: MEDIDA_SEARCH, autoCompleteColumns: MEDIDA_COLUMNS, conditional: isCombinado},
                        {name: 'exibirValor', label: 'Exibir Valor', type: 'boolean', booleanLabels: {on: 'Sim', off: 'Não'}},
                        {name: 'exibirLegenda', label: 'Exibir Legenda', type: 'boolean', booleanLabels: {on: 'Sim', off: 'Não'}},
                        {name: 'exibirPercentual', label: 'Exibir Percentual', type: 'boolean', booleanLabels: {on: 'Sim', off: 'Não'}, conditional: isPizzaOuCircular},
                        {name: 'valorAcumulado', label: 'Acumulado', type: 'boolean', booleanLabels: {on: 'Sim', off: 'Não'}, conditional: isBarra},
                        {name: 'posicao', label: 'Posição Legenda', type: 'select', options: POSICAO_LEGENDA_OPTIONS, conditional: entity.exibirLegenda},
                        {name: 'colunaLegenda', label: 'Coluna Legenda', type: 'number', conditional: entity.exibirLegenda},
                        {name: 'coluna', label: 'Coluna Gráfico', type: 'number', conditional: isPizzaOuCircular},
                        {name: 'altura', label: 'Altura Gráfico', type: 'number'},
                        {name: 'diametro', label: 'Diâmetro', type: 'number', conditional: entity.tipo === 'PIZZA'},
                        {name: 'margem', label: 'Margem Separação', type: 'number', conditional: entity.tipo === 'CIRCULAR'},
                        {name: 'formatoData', label: 'Formato Data', type: 'select', options: FORMATO_DATA_OPTIONS, conditional: isTipoEixoSimples},
                    ],
                    customContent: entity.tipoEixo === 1 && !isCombinado ? (
                        <div style={{marginTop: '20px'}}>
                            <h3>Eixos do Gráfico</h3>
                            <div style={{marginBottom: '15px'}}>
                                <AutoComplete
                                    label="Dimensão Informação"
                                    source={DIMENSAO_SOURCE}
                                    searchKeys={DIMENSAO_SEARCH}
                                    columns={DIMENSAO_COLUMNS}
                                />
                                <AutoComplete
                                    label="Medida Informação"
                                    source={MEDIDA_SOURCE}
                                    searchKeys={MEDIDA_SEARCH}
                                    columns={MEDIDA_COLUMNS}
                                />
                                <select className="form-input form-select" style={{width: '200px', marginTop: '10px'}}>
                                    {TIPO_GRAFICO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                            <DataTable
                                data={graficoEixos}
                                columns={[
                                    {key: 'dimensaoNome', label: 'Dimensão Informação'},
                                    {key: 'dimensaoTipo', label: 'Dimensão Tipo'},
                                    {key: 'medidaNome', label: 'Medida Informação'},
                                    {key: 'medidaTipo', label: 'Medida Tipo'},
                                ]}
                                actions={[
                                    {key: 'remove', label: 'Remover', icon: 'minus', className: 'btnred', onClick: removeEixo},
                                ]}
                            />
                        </div>
                    ) : undefined,
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