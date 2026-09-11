import type {MasterDetailColumn} from './MasterDetail';

export const UNIDADE_SOURCE = '/api/view/unidade/listUnidade';
export const UNIDADE_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'sucinto', label: 'Sucinto'},
    {key: 'razaoSocial', label: 'Razão Social'},
    {key: 'nomeFantasia', label: 'Nome Fantasia'},
    {key: 'CNPJ', label: 'CNPJ'},
    {key: 'ativo', label: 'Ativo'},
];
export const UNIDADE_SEARCH = ['sucinto', 'razaoSocial', 'nomeFantasia'];

export const CAMPO_SOURCE = '/api/view/campo/listCampo';
export const CAMPO_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'rotulo', label: 'Rótulo'},
    {key: 'nome', label: 'Nome'},
    {key: 'tipo', label: 'Tipo de Campo'},
    {key: 'categoria', label: 'Categoria de Campo'},
];
export const CAMPO_SEARCH = ['rotulo', 'nome', 'tipo'];

export const TIPO_CURSO_SOURCE = '/api/view/tipoCurso/listTipoCurso';
export const TIPO_CURSO_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'descricao', label: 'Descrição'},
];
export const TIPO_CURSO_SEARCH = ['descricao'];

export const PERFIL_SOURCE = '/api/view/perfil/listPerfil';
export const PERFIL_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'descricao', label: 'Descrição'},
];
export const PERFIL_SEARCH = ['descricao'];

export const USUARIO_SOURCE = '/api/view/usuario/listUsuario';
export const USUARIO_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'login', label: 'Login'},
    {key: 'nome', label: 'Nome'},
];
export const USUARIO_SEARCH = ['login', 'nome'];

export const AGENDA_SOURCE = '/api/view/agenda/listAgenda';
export const AGENDA_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'descricao', label: 'Descrição'},
    {key: 'agendar', label: 'Agendar', render: (item: any) => (item?.agendar ? 'SIM' : 'NÃO')},
    {key: 'alterar', label: 'Alterar', render: (item: any) => (item?.alterar ? 'SIM' : 'NÃO')},
    {key: 'fechar', label: 'Fechar', render: (item: any) => (item?.fechar ? 'SIM' : 'NÃO')},
    {key: 'iniciar', label: 'Iniciar', render: (item: any) => (item?.iniciar ? 'SIM' : 'NÃO')},
    {key: 'atender', label: 'Atender', render: (item: any) => (item?.atender ? 'SIM' : 'NÃO')},
];
export const AGENDA_SEARCH = ['descricao'];

export const PESSOA_SOURCE = '/api/view/pessoa/listPessoa';
export const PESSOA_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'nome', label: 'Nome'},
    {key: 'pessoaFisica', label: 'Pessoa Física'},
    {key: 'pessoaJuridica', label: 'Pessoa Jurídica'},
];
export const PESSOA_SEARCH = ['nome', 'cpf', 'cnpj'];

export const TURMA_SOURCE = '/api/view/oferecimentoComponenteCurricular/listOferecimentoComponenteCurricular';
export const TURMA_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'unidade', label: 'Unidade'},
    {key: 'grupo', label: 'Grupo'},
    {key: 'curriculo', label: 'Curso'},
    {key: 'status', label: 'Status'},
];
export const TURMA_SEARCH = ['id'];

export const COMPONENTE_SOURCE = '/api/view/componenteCurricular/listComponenteCurricular';
export const COMPONENTE_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'descricao', label: 'Descrição'},
    {key: 'sucinto', label: 'Sucinto'},
    {key: 'cargaHoraria', label: 'Carga Horária'},
];
export const COMPONENTE_SEARCH = ['descricao', 'sucinto'];

export const CURSO_SOURCE = '/api/view/curriculo/listCurriculo';
export const CURSO_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'curso', label: 'Curso'},
    {key: 'sucinto', label: 'Sucinto'},
    {key: 'tipoCurso', label: 'Tipo Curso'},
];
export const CURSO_SEARCH = ['sucinto'];

export const GRUPO_COMPONENTECOMPONENTE_SOURCE = '/api/educacao/grupo-componente-curricular';
export const GRUPO_COMPONENTECOMPONENTE_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'descricao', label: 'Descrição'},
];
export const GRUPO_COMPONENTECOMPONENTE_SEARCH = ['descricao'];

export const TIPO_MATRIZ_CURRICULAR_SOURCE = '/api/educacao/tipo-matriz-curricular';
export const TIPO_MATRIZ_CURRICULAR_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'descricao', label: 'Descrição'},
];
export const TIPO_MATRIZ_CURRICULAR_SEARCH = ['descricao'];

export const MODALIDADE_SOURCE = '/api/educacao/modalidade';
export const MODALIDADE_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'descricao', label: 'Descrição'},
];
export const MODALIDADE_SEARCH = ['descricao'];

export const ETAPAS_SOURCE = '/api/view/etapasCobranca/listEtapasCobranca';
export const ETAPAS_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'descricao', label: 'Descrição'},
    {key: 'ordem', label: 'Ordem'},
];
export const ETAPAS_SEARCH = ['descricao'];

export const RESULTADO_COBRANCA_SOURCE = '/api/view/resultadoCobranca/listResultadoCobranca';
export const RESULTADO_COBRANCA_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'descricao', label: 'Descrição'},
    {key: 'ordem', label: 'Ordem'},
];
export const RESULTADO_COBRANCA_SEARCH = ['descricao'];

export const TURNO_TRABALHO_SOURCE = '/api/view/turnoTrabalho/listTurnoTrabalho';
export const TURNO_TRABALHO_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'descricao', label: 'Descrição'},
    {key: 'inicio', label: 'Início'},
    {key: 'fim', label: 'Fim'},
    {key: 'diaSemana', label: 'Dia Semana'},
];
export const TURNO_TRABALHO_SEARCH = ['descricao'];

export const ESTRUTURA_SOURCE = '/api/relatorios/estrutura';
export const ESTRUTURA_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'nome', label: 'Nome'},
    {key: 'descricao', label: 'Descrição'},
];
export const ESTRUTURA_SEARCH = ['nome', 'descricao'];

export const DIMENSAO_SOURCE = '/api/relatorios/dimensao';
export const DIMENSAO_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'nomeVisualizacao', label: 'Nome Visualização'},
    {key: 'nome', label: 'Nome'},
    {key: 'tipo', label: 'Tipo'},
    {key: 'tipoInfo', label: 'Tipo Info'},
];
export const DIMENSAO_SEARCH = ['nomeVisualizacao', 'nome'];

export const MEDIDA_SOURCE = '/api/relatorios/medida';
export const MEDIDA_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'nomeVisualizacao', label: 'Nome Visualização'},
    {key: 'nome', label: 'Nome'},
    {key: 'tipo', label: 'Tipo'},
    {key: 'tipoInfo', label: 'Tipo Info'},
];
export const MEDIDA_SEARCH = ['nomeVisualizacao', 'nome'];

export const GEOREFERENCIA_SOURCE = '/api/relatorios/georeferencia';
export const GEOREFERENCIA_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'nomeVisualizacao', label: 'Nome Visualização'},
    {key: 'nome', label: 'Nome'},
];
export const GEOREFERENCIA_SEARCH = ['nomeVisualizacao', 'nome'];

export const FILTRO_SOURCE = '/api/relatorios/filtro';
export const FILTRO_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'nome', label: 'Nome'},
    {key: 'estruturaNome', label: 'Estrutura'},
    {key: 'dimensaoNome', label: 'Dimensão'},
];
export const FILTRO_SEARCH = ['nome'];

export const TABELA_SOURCE = '/api/relatorios/tabela';
export const TABELA_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'nome', label: 'Nome'},
];
export const TABELA_SEARCH = ['nome'];

export const GRAFICO_SOURCE = '/api/relatorios/grafico';
export const GRAFICO_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'nome', label: 'Nome'},
    {key: 'tipo', label: 'Tipo'},
];
export const GRAFICO_SEARCH = ['nome'];

export const MAPA_SOURCE = '/api/relatorios/mapa';
export const MAPA_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'nome', label: 'Nome'},
];
export const MAPA_SEARCH = ['nome'];

export const ORGANOGRAMA_TOPICO_SOURCE = '/api/relatorios/organograma-topico';
export const ORGANOGRAMA_TOPICO_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'relatorioNome', label: 'Relatório'},
    {key: 'tipo', label: 'Tipo'},
    {key: 'ordem', label: 'Ordem'},
];
export const ORGANOGRAMA_TOPICO_SEARCH = ['relatorioNome'];

export const PAINEL_PAINEL_SOURCE = '/api/relatorios/painel-painel';
export const PAINEL_PAINEL_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'relatorioNome', label: 'Relatório'},
    {key: 'tipo', label: 'Tipo'},
    {key: 'ordem', label: 'Ordem'},
];
export const PAINEL_PAINEL_SEARCH = ['relatorioNome'];

export const DIA_AULA_SOURCE = '/api/educacao/dia-aula';
export const DIA_AULA_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'diaSemanaId', label: 'Dia Semana'},
    {key: 'turnoEducacaoId', label: 'Turno'},
    {key: 'tempoAulaId', label: 'Tempo Aula'},
    {key: 'turnoEducacao_descricao', label: 'Turno'},
    {key: 'tempoAula_descricao', label: 'Tempo'},
];
export const DIA_AULA_SEARCH = ['id'];
