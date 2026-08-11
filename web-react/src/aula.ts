import { api } from './api';

export type ContratoAula = {
  id: number;
  curso: string;
};

export type OferecimentoAula = {
  id: number;
  modulo: string;
};

export type OcorrenciaAula = {
  id: number;
  data: string | null;
  aulaCoringa: boolean;
  aulaPresencial: boolean;
};

export type Aula = {
  id: number;
  nome: string;
  descricao: string;
  ocorrenciaComponenteCurricularId: number | null;
};

export type AulaAnexo = {
  id: number;
  aulaId: number;
  nome: string;
  anexo: string;
  tipo: string;
};

export type AulaAssistida = {
  aulaId: number;
  pessoaId: number;
  dataAssistida: string | null;
};

export const aulaApi = {
  contratos: () => api.get<ContratoAula[]>('/api/aula/aula/contratos').then(r => r.data),
  oferecimentos: (contratoId: number) => api.get<OferecimentoAula[]>('/api/aula/aula/oferecimentos', { params: { contratoId } }).then(r => r.data),
  ocorrencias: (oferecimentoId: number) => api.get<OcorrenciaAula[]>('/api/aula/aula/ocorrencias', { params: { oferecimentoId } }).then(r => r.data),
  aulasDaOcorrencia: (ocorrenciaId: number) => api.get<Aula[]>('/api/aula/aula/por-ocorrencia', { params: { ocorrenciaId } }).then(r => r.data),
  aula: (id: number) => api.get<Aula>(`/api/aula/aula/${id}`).then(r => r.data),
  anexosDaAula: (aulaId: number) => api.get<AulaAnexo[]>('/api/aula/aula-anexo/por-aula', { params: { aulaId } }).then(r => r.data),
  jaAssistida: (aulaId: number) => api.get<boolean>(`/api/aula/aula/${aulaId}/assistida`).then(r => r.data),
  marcarAssistida: (aulaId: number) => api.post<AulaAssistida>(`/api/aula/aula/${aulaId}/assistida`, {}).then(r => r.data),
};

export function formatarDataAula(valor: string | null | undefined): string {
  if (!valor) return '-';
  const [ano, mes, dia] = valor.split('T')[0].split('-');
  if (!ano || !mes || !dia) return valor;
  const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const data = new Date(Date.UTC(Number(ano), Number(mes) - 1, Number(dia)));
  return `${dias[data.getUTCDay()]}, ${dia}/${mes}/${ano}`;
}
