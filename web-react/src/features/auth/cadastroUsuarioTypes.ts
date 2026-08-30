export type TipoPessoa = 'FISICA' | 'JURIDICA';

export interface PessoaFisicaFormData {
  login: string;
  senha: string;
  cpf: string;
  rg: string;
  nome: string;
  email: string;
  nomeSocial: string;
  dataNascimento: string;
  cidadeOrigem: string;
  generoId: string;
  etniaId: string;
  estadoCivilId: string;
  escolaridadeId: string;
  nomePai: string;
  nomeMae: string;
  nomeReferencia: string;
  telefoneReferencia: string;
  celularReferencia: string;
  nomeReferencia2: string;
  telefoneReferencia2: string;
  celularReferencia2: string;
  telefoneResidencial: string;
  telefoneComercial: string;
  celular: string;
  facebook: string;
  twitter: string;
  googlePlus: string;
  telegram: string;
  observacao: string;
}

export interface PessoaJuridicaFormData {
  login: string;
  senha: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  inscricaoMunicipal: string;
  inscricaoEstadual: string;
  email: string;
  fax: string;
  telefone: string;
  celular: string;
  observacao: string;
}

export interface EnderecoFormData {
  id?: number;
  cep: string;
  cidade: string;
  bairro: string;
  logradouro: string;
  numero: string;
  complemento: string;
}

export interface CadastroUsuarioFormData {
  tipoPessoa: TipoPessoa;
  pessoaFisica?: PessoaFisicaFormData;
  pessoaJuridica?: PessoaJuridicaFormData;
  enderecos: EnderecoFormData[];
  unidades: number[];
  curriculo: boolean;
}

export const GENEROS = [
  { value: '1', label: 'Masculino' },
  { value: '2', label: 'Feminino' },
  { value: '3', label: 'Outro' },
];

export const ETNIAS = [
  { value: '1', label: 'Branca' },
  { value: '2', label: 'Preta' },
  { value: '3', label: 'Parda' },
  { value: '4', label: 'Amarela' },
  { value: '5', label: 'Indígena' },
];

export const ESTADOS_CIVIS = [
  { value: '1', label: 'Solteiro(a)' },
  { value: '2', label: 'Casado(a)' },
  { value: '3', label: 'Divorciado(a)' },
  { value: '4', label: 'Viúvo(a)' },
  { value: '5', label: 'União Estável' },
];

export const ESCOLARIDADES = [
  { value: '1', label: 'Ensino Fundamental Incompleto' },
  { value: '2', label: 'Ensino Fundamental Completo' },
  { value: '3', label: 'Ensino Médio Incompleto' },
  { value: '4', label: 'Ensino Médio Completo' },
  { value: '5', label: 'Superior Incompleto' },
  { value: '6', label: 'Superior Completo' },
  { value: '7', label: 'Pós-Graduação' },
];

export const emptyPessoaFisica: PessoaFisicaFormData = {
  login: '',
  senha: '',
  cpf: '',
  rg: '',
  nome: '',
  email: '',
  nomeSocial: '',
  dataNascimento: '',
  cidadeOrigem: '',
  generoId: '',
  etniaId: '',
  estadoCivilId: '',
  escolaridadeId: '',
  nomePai: '',
  nomeMae: '',
  nomeReferencia: '',
  telefoneReferencia: '',
  celularReferencia: '',
  nomeReferencia2: '',
  telefoneReferencia2: '',
  celularReferencia2: '',
  telefoneResidencial: '',
  telefoneComercial: '',
  celular: '',
  facebook: '',
  twitter: '',
  googlePlus: '',
  telegram: '',
  observacao: '',
};

export const emptyPessoaJuridica: PessoaJuridicaFormData = {
  login: '',
  senha: '',
  cnpj: '',
  razaoSocial: '',
  nomeFantasia: '',
  inscricaoMunicipal: '',
  inscricaoEstadual: '',
  email: '',
  fax: '',
  telefone: '',
  celular: '',
  observacao: '',
};

export const emptyCadastroUsuario: CadastroUsuarioFormData = {
  tipoPessoa: 'FISICA',
  pessoaFisica: emptyPessoaFisica,
  pessoaJuridica: emptyPessoaJuridica,
  enderecos: [],
  unidades: [],
  curriculo: false,
};

export function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function toDateInput(v: unknown): string {
  if (!v) return '';
  const d = new Date(v as string);
  if (isNaN(d.getTime())) return String(v).slice(0, 10);
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function str(v: unknown): string {
  return v === null || v === undefined ? '' : String(v);
}

export function num(v: string): number | null {
  return v !== '' && !isNaN(Number(v)) ? Number(v) : null;
}

export function semId<T extends Record<string, unknown>>(obj: T | null): Partial<T> {
  const copia = { ...(obj ?? {}) };
  delete copia.id;
  return copia;
}
