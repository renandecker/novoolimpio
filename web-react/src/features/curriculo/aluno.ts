import {api} from '../../shared/services/api';

export type CurriculoCampo = {
    id: number;
    nome: string;
    descricao: string | null;
    tipo: string | null;
    ordem: number | null;
    flAtivo: boolean | null;
    curriculoId: number | null;
};

export type Curriculo = {
    id: number;
    nome: string;
    descricao: string | null;
    dataCriacao: string | null;
    dataAtualizacao: string | null;
    campos: CurriculoCampo[];
};

export type CurriculoFormStep = 'curriculo' | 'licenca' | 'matrizCurricular' | 'requisitos' | 'unidade' | 'material' | 'presencas' | 'notas' | 'documentos';

export type CurriculoStepData = {
    curriculo: string;
    licenca: string;
    matrizCurricular: string;
    requisitos: string;
    unidade: string;
    material: string;
    presencas: string;
    notas: string;
    documentos: string;
};

export const curriculoApi = {
    list: () => api.get<Curriculo[]>('/api/curriculo/list').then(r => r.data),
    get: (id: number) => api.get<Curriculo>(`/api/curriculo/${id}`).then(r => r.data),
    create: (data: any) => api.post<Curriculo>('/api/curriculo', data).then(r => r.data),
    update: (id: number, data: any) => api.put<Curriculo>(`/api/curriculo/${id}`, data).then(r => r.data),
};