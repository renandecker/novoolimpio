import type { MasterDetailColumn } from './MasterDetail';

export const UNIDADE_SOURCE = '/api/view/unidade/listUnidade';
export const UNIDADE_COLUMNS: MasterDetailColumn[] = [
  { key: 'id', label: 'Id' },
  { key: 'sucinto', label: 'Sucinto' },
  { key: 'razaoSocial', label: 'Razão Social' },
  { key: 'nomeFantasia', label: 'Nome Fantasia' },
  { key: 'CNPJ', label: 'CNPJ' },
  { key: 'ativo', label: 'Ativo' },
];
export const UNIDADE_SEARCH = ['sucinto', 'razaoSocial', 'nomeFantasia'];

export const CAMPO_SOURCE = '/api/view/campo/listCampo';
export const CAMPO_COLUMNS: MasterDetailColumn[] = [
  { key: 'id', label: 'Id' },
  { key: 'rotulo', label: 'Rótulo' },
  { key: 'nome', label: 'Nome' },
  { key: 'tipo', label: 'Tipo de Campo' },
  { key: 'categoria', label: 'Categoria de Campo' },
];
export const CAMPO_SEARCH = ['rotulo', 'nome', 'tipo'];

export const TIPO_CURSO_SOURCE = '/api/view/tipoCurso/listTipoCurso';
export const TIPO_CURSO_COLUMNS: MasterDetailColumn[] = [
  { key: 'id', label: 'Id' },
  { key: 'descricao', label: 'Descrição' },
];
export const TIPO_CURSO_SEARCH = ['descricao'];

export const PERFIL_SOURCE = '/api/view/perfil/listPerfil';
export const PERFIL_COLUMNS: MasterDetailColumn[] = [
  { key: 'id', label: 'Id' },
  { key: 'descricao', label: 'Descrição' },
];
export const PERFIL_SEARCH = ['descricao'];

export const USUARIO_SOURCE = '/api/view/usuario/listUsuario';
export const USUARIO_COLUMNS: MasterDetailColumn[] = [
  { key: 'id', label: 'Id' },
  { key: 'login', label: 'Login' },
  { key: 'nome', label: 'Nome' },
];
export const USUARIO_SEARCH = ['login', 'nome'];

export const AGENDA_SOURCE = '/api/view/agenda/listAgenda';
export const AGENDA_COLUMNS: MasterDetailColumn[] = [
  { key: 'id', label: 'Id' },
  { key: 'descricao', label: 'Descrição' },
];
export const AGENDA_SEARCH = ['descricao'];

export const PESSOA_SOURCE = '/api/view/pessoa/listPessoa';
export const PESSOA_COLUMNS: MasterDetailColumn[] = [
  { key: 'id', label: 'Id' },
  { key: 'nome', label: 'Nome' },
  { key: 'pessoaFisica', label: 'Pessoa Física' },
  { key: 'pessoaJuridica', label: 'Pessoa Jurídica' },
];
export const PESSOA_SEARCH = ['nome', 'cpf', 'cnpj'];

export const TURMA_SOURCE = '/api/view/oferecimentoComponenteCurricular/listOferecimentoComponenteCurricular';
export const TURMA_COLUMNS: MasterDetailColumn[] = [
  { key: 'id', label: 'Id' },
  { key: 'unidade', label: 'Unidade' },
  { key: 'grupo', label: 'Grupo' },
  { key: 'curriculo', label: 'Curso' },
  { key: 'status', label: 'Status' },
];
export const TURMA_SEARCH = ['id'];

export const COMPONENTE_SOURCE = '/api/view/componenteCurricular/listComponenteCurricular';
export const COMPONENTE_COLUMNS: MasterDetailColumn[] = [
  { key: 'id', label: 'Id' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'sucinto', label: 'Sucinto' },
  { key: 'cargaHoraria', label: 'Carga Horária' },
];
export const COMPONENTE_SEARCH = ['descricao', 'sucinto'];

export const CURSO_SOURCE = '/api/view/curriculo/listCurriculo';
export const CURSO_COLUMNS: MasterDetailColumn[] = [
  { key: 'id', label: 'Id' },
  { key: 'curso', label: 'Curso' },
  { key: 'sucinto', label: 'Sucinto' },
  { key: 'tipoCurso', label: 'Tipo Curso' },
];
export const CURSO_SEARCH = ['sucinto'];

export const GRUPO_SOURCE = '/api/view/grupo/listGrupo';
export const GRUPO_COLUMNS: MasterDetailColumn[] = [
  { key: 'id', label: 'Id' },
  { key: 'nome', label: 'Nome' },
];
export const GRUPO_SEARCH = ['nome'];

export const ETAPAS_SOURCE = '/api/view/etapasCobranca/listEtapasCobranca';
export const ETAPAS_COLUMNS: MasterDetailColumn[] = [
  { key: 'id', label: 'Id' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'ordem', label: 'Ordem' },
];
export const ETAPAS_SEARCH = ['descricao'];

export const RESULTADO_COBRANCA_SOURCE = '/api/view/resultadoCobranca/listResultadoCobranca';
export const RESULTADO_COBRANCA_COLUMNS: MasterDetailColumn[] = [
  { key: 'id', label: 'Id' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'ordem', label: 'Ordem' },
];
export const RESULTADO_COBRANCA_SEARCH = ['descricao'];

export const TURNO_TRABALHO_SOURCE = '/api/view/turnoTrabalho/listTurnoTrabalho';
export const TURNO_TRABALHO_COLUMNS: MasterDetailColumn[] = [
  { key: 'id', label: 'Id' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'inicio', label: 'Início' },
  { key: 'fim', label: 'Fim' },
  { key: 'diaSemana', label: 'Dia Semana' },
];
export const TURNO_TRABALHO_SEARCH = ['descricao'];
