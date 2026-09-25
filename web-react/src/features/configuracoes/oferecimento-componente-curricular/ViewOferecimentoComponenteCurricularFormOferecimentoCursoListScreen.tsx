import {useCallback, useEffect, useMemo, useRef, useState} from 'react';



import {X, ChevronDown, ChevronRight} from 'lucide-react';

import {useNavigate, useSearchParams} from 'react-router-dom';

import {useQuery, useQueryClient} from '@tanstack/react-query';

import {api} from '../../../shared/services/api';

import {PermissionGate} from '../../../shared/services/permissions';

import {AutoComplete, type AutoCompleteOption} from '../../../shared/components/AutoComplete';

import {ScheduleWeekView, mondayOf, toIsoDate, monthRangeForWeek} from '../../../shared/components/WeeklyGrid';

import type {ScheduleEventData} from '../../../shared/components/WeeklyGrid';

import {Modal} from '../../../shared/components/Modal';
import {ProfessorAvailabilityModal} from '../../../shared/components/ProfessorAvailabilityModal';

import {BooleanField} from '../../../shared/components/BooleanField';

import '../OferecimentoCurso.css';
type Opcao = {id: number; label: string};



interface UnidadeRow {

    id: number;

    sucinto?: string;

    razao_social?: string;

    nome_fantasia?: string;

    fl_ativo?: boolean;

}



interface GrupoRow {

    id: number;

    nome?: string;

    unidadeId?: number;

    curriculoId?: number;

}



interface CurriculoRow {

    id: number;

    descricao?: string;

    sucinto?: string;

    sigla?: string;

    qtd_maxima_alunos?: number;

    periodo?: number;

}



interface SalaRow {

    id: number;

    numero?: number;

    descricao?: string;

    sucinto?: string;

    qtd_alunos?: number;

}



interface DiaSemanaRow {

    id: number;

    nome?: string;

}



interface TurnoRow {

    id: number;

    descricao?: string;

    sucinto?: string;

    inicio?: string | number[];

    fim?: string | number[];

}



interface TempoAulaRow {

    id: number;

    descricao?: string;

    minutosAula?: number;

    minutos?: number;

}



interface ComponenteRow {

    id: number;

    descricao?: string;

    sucinto?: string;

    cargaHoraria?: number;

}



interface DiaAulaRowApi {

    id: number;

    diaSemanaId?: number;

    turnoEducacaoId?: number;

    tempoAulaId?: number;

}



interface OferecimentoTurmaApi {

    id?: number;

    unidadeId?: number;

    grupoId?: number;

    salaId?: number;

    dataInicio?: string;

    dataFim?: string;

    dataCancelamento?: string;

    qtdeSequencia?: number;

    curriculoId?: number;

    professorId?: number;

    componenteCurricularId?: number;

    vagas?: number;

    inscritos?: number;

    registraFrequencia?: boolean;

    possuiAvaliacao?: boolean;

    replicar?: boolean;

    componenteCurricular_descricao?: string;

    professor_descricao?: string;

    sala_descricao?: string;

}



interface DiaAulaItem {

    diaSemanaId: number;

    turnoEducacaoId: number;

    tempoAulaId: number;

}



interface OcorrenciaItem {

    key: string;

    componenteCurricularId: number;

    data: string;

    diaAulaIndex: number;

    aulaPresencial: boolean;

}



interface TurmaItem {

    componenteCurricularId: number;

    descricao: string;

    cargaHoraria: number;

    turmaId?: number;

    ocorrencias: OcorrenciaItem[];

    professorId?: number;

}



interface DataInvalidaItem {

    data: string;

    motivo: string;

}



type TabKey = 'tabGrupo' | 'tabDiaAula' | 'tabProfessor';



interface OferecimentoCursoData {

    novoGrupo: boolean;

    grupoId: number | null;

    grupoNome: string;

    unidadeId: number | null;

    curriculoId: number | null;

    registraFrequencia: boolean;

    possuiAvaliacao: boolean;

    replicar: boolean;

    dataCancelamento: string;

    dataFim: string;

    responsaveis: AutoCompleteOption[];

    salaId: number | null;

    qtdeSequencia: number;

    vagas: number;

    dataInicio: string;

    diasAula: DiaAulaItem[];

    novoDiaDiaSemana: number | null;

    novoDiaTurno: number | null;

    novoDiaTempoAula: number | null;

    professores: Record<string, number>;

    criterio: {qtdTurmaAbertas?: number; dataInicio?: string; dataFim?: string; periodo?: number} | null;

}



const initialData: OferecimentoCursoData = {

    novoGrupo: true,

    grupoId: null,

    grupoNome: '',

    unidadeId: null,

    curriculoId: null,

    registraFrequencia: false,

    possuiAvaliacao: false,

    replicar: false,

    dataCancelamento: '',

    dataFim: '',

    responsaveis: [],

    salaId: null,

    qtdeSequencia: 0,

    vagas: 0,

    dataInicio: '',

    diasAula: [],

    novoDiaDiaSemana: null,

    novoDiaTurno: null,

    novoDiaTempoAula: null,

    professores: {},

    criterio: null,

};



const DIA_SEMANA_JS_PARA_ID = [1, 2, 3, 4, 5, 6, 7];



const isoDate = (value: unknown): string => {

    if (!value) return '';

    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));

    return match ? `${match[1]}-${match[2]}-${match[3]}` : '';

};



const brDate = (value: string): string => {

    if (!value) return '';

    const [ano, mes, dia] = value.split('-');

    return dia && mes && ano ? `${dia}/${mes}/${ano}` : value;

};



const parseHoraMinutos = (value: string | number[] | undefined): number | null => {

    if (!value) return null;

    if (Array.isArray(value)) {

        const [h = 0, m = 0] = value;

        return h * 60 + m;

    }

    const parts = String(value).split(':');

    const h = Number(parts[0]);

    const m = Number(parts[1] ?? 0);

    if (Number.isNaN(h)) return null;

    return h * 60 + (Number.isNaN(m) ? 0 : m);

};



const toOptions = (rows: Array<Record<string, unknown>> | undefined, labelKeys: string[]): Opcao[] =>

    (rows ?? []).map((row) => {

        let label = '';

        for (const key of labelKeys) {

            const value = row[key];

            if (value !== null && value !== undefined && String(value).trim() !== '') {

                label = String(value);

                break;

            }

        }

        return {id: Number(row.id), label: label || `#${row.id}`};

    });



const TABS: {key: TabKey; label: string}[] = [
    {key: 'tabGrupo', label: 'Grupo / Curso'},
    {key: 'tabDiaAula', label: 'Dias de Aula'},
    {key: 'tabProfessor', label: 'Professores'},
];


const LEGENDA_OFERECIMENTO = [
    {className: 'evento-yellow', label: 'Em andamento'},
    {className: 'evento-green', label: 'Liberada'},
    {className: 'evento-orange', label: 'Pendente'},
    {className: 'evento-red', label: 'Lotada'},
    {className: 'evento-black', label: 'Concluída'},
    {className: 'evento-purple', label: 'Finalizada'},
    {className: 'evento-blue', label: 'Outro / Feriado'},
];

const LEGENDA_TODAS = [
    {className: 'evento-blue', label: 'Feriado'},
    {className: 'evento-yellow', label: 'Aula (todas as salas)'},
];

const LEGENDA_SALA = [
    {className: 'evento-blue', label: 'Feriado'},
    {className: 'evento-black', label: 'Aula na sala'},
];


export default function ViewOferecimentoComponenteCurricularFormOferecimentoCursoListScreen() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const id = searchParams.get('id');
    const emEdicao = !!id;


    const [data, setData] = useState<OferecimentoCursoData>(initialData);

    const [activeTab, setActiveTab] = useState<TabKey>('tabGrupo');

    const [turmas, setTurmas] = useState<TurmaItem[]>([]);

    const [cursosDaUnidade, setCursosDaUnidade] = useState<Opcao[]>([]);

    const [salasDaUnidade, setSalasDaUnidade] = useState<Opcao[]>([]);

    const [salasDetalhe, setSalasDetalhe] = useState<SalaRow[]>([]);

    const [curriculosDetalhe, setCurriculosDetalhe] = useState<CurriculoRow[]>([]);

    const [datasInvalidas, setDatasInvalidas] = useState<DataInvalidaItem[]>([]);

    const [expandido, setExpandido] = useState<number | null>(null);

    const [dialogOferecimentos, setDialogOferecimentos] = useState(false);

    const [oferecimentosConsulta, setOferecimentosConsulta] = useState<OferecimentoTurmaApi[]>([]);

    const [mensagem, setMensagem] = useState<string | null>(null);

    const [erro, setErro] = useState<string | null>(null);

    const [salvando, setSalvando] = useState(false);

    const [bloquearProximo, setBloquearProximo] = useState(false);

    const [disponibilidadeModalOpen, setDisponibilidadeModalOpen] = useState(false);

    const [professorAvailabilityOpen, setProfessorAvailabilityOpen] = useState(false);
    const [selectedProfessorId, setSelectedProfessorId] = useState<number | null>(null);
    const [selectedProfessorNome, setSelectedProfessorNome] = useState<string | null>(null);

    const [disponibilidadeSalaId, setDisponibilidadeSalaId] = useState<number | null>(null);

    const [disponibilidadeUnidadeId, setDisponibilidadeUnidadeId] = useState<number | null>(null);

    const [disponibilidadeWeekStart, setDisponibilidadeWeekStart] = useState(() => toIsoDate(mondayOf(new Date())));

    const hidratadoRef = useRef(false);



    const updateField = useCallback(<K extends keyof OferecimentoCursoData>(key: K, value: OferecimentoCursoData[K]) => {

        setData(prev => ({...prev, [key]: value}));

    }, []);



    const updateFields = useCallback((fields: Partial<OferecimentoCursoData>) => {

        setData(prev => ({...prev, ...fields}));

    }, []);



    const unidadesQuery = useQuery({

        queryKey: ['ofc-unidades'],

        queryFn: async () => (await api.get<UnidadeRow[]>('/api/view/unidade/listUnidade')).data,

    });



    const gruposQuery = useQuery({

        queryKey: ['ofc-grupos'],

        queryFn: async () => (await api.get<GrupoRow[]>('/api/educacao/oferecimento-curso')).data,

    });



    const curriculosQuery = useQuery({

        queryKey: ['ofc-curriculos'],

        queryFn: async () => (await api.get<CurriculoRow[]>('/api/view/curriculo/listCurriculo')).data,

    });



    const salasQuery = useQuery({

        queryKey: ['ofc-salas'],

        queryFn: async () => (await api.get<SalaRow[]>('/api/view/sala/listSala')).data,

    });



    const diasSemanaQuery = useQuery({

        queryKey: ['ofc-dias-semana'],

        queryFn: async () => (await api.get<DiaSemanaRow[]>('/api/view/diaSemana/listDiaSemana')).data,

    });



    const turnosQuery = useQuery({

        queryKey: ['ofc-turnos'],

        queryFn: async () => (await api.get<TurnoRow[]>('/api/educacao/turno-educacao')).data,

    });



    const temposAulaQuery = useQuery({

        queryKey: ['ofc-tempos-aula'],

        queryFn: async () => (await api.get<TempoAulaRow[]>('/api/educacao/tempo-aula')).data,

    });



    const componentesQuery = useQuery({

        queryKey: ['ofc-componentes'],

        queryFn: async () => (await api.get<ComponenteRow[]>('/api/educacao/componente-curricular')).data,

    });


    const disponibilidadeUnidadesQuery = useQuery({

        queryKey: ['disp-sala-unidades'],

        queryFn: async () => (await api.get<UnidadeRow[]>('/api/view/unidade/listUnidade')).data,

    });

    const disponibilidadeSalasQuery = useQuery({

        queryKey: ['disp-sala-salas', disponibilidadeUnidadeId],

        queryFn: async () => (await api.get<SalaRow[]>('/api/educacao/sala')).data,

        enabled: !!disponibilidadeUnidadeId,

    });

    const {inicio: disponibilidadeRangeInicio, fim: disponibilidadeRangeFim} = monthRangeForWeek(disponibilidadeWeekStart);

    const disponibilidadeEventosQuery = useQuery({

        queryKey: ['disp-sala-eventos', disponibilidadeUnidadeId, disponibilidadeSalaId, disponibilidadeRangeInicio, disponibilidadeRangeFim],

        queryFn: async () =>

            (

                await api.get<ScheduleEventData[]>('/api/educacao/disponibilidade-sala/schedule-events', {

                    params: {

                        unidadeId: disponibilidadeUnidadeId,

                        ...(disponibilidadeSalaId ? {salaId: disponibilidadeSalaId} : {}),

                        inicio: disponibilidadeRangeInicio,

                        fim: disponibilidadeRangeFim,

                    },

                })

            ).data,

        enabled: !!disponibilidadeUnidadeId,

    });



    const unidades = useMemo(

        () => toOptions(unidadesQuery.data as unknown as Array<Record<string, unknown>>, ['sucinto', 'nome_fantasia', 'razao_social'])

            .filter((opcao) => (unidadesQuery.data ?? []).find((u) => u.id === opcao.id)?.fl_ativo !== false),

        [unidadesQuery.data],

    );



const gruposDisponiveis = useMemo(
        () => {
            const base = (gruposQuery.data ?? []).filter((g) =>
                (!data.unidadeId || g.unidadeId === data.unidadeId) &&
                (!data.curriculoId || g.curriculoId === data.curriculoId));
            if (emEdicao && data.grupoId && !base.some((g) => g.id === data.grupoId)) {
                const current = gruposQuery.data?.find((g) => g.id === data.grupoId);
                if (current) return [...base, current];
            }
            return base;
        },
        [gruposQuery.data, data.unidadeId, data.curriculoId, emEdicao, data.grupoId],
    );


    const carregarCatalogosUnidade = useCallback(async (unidadeId: number) => {

        try {

            const idsCursos = await api.get<number[]>('/api/educacao/curriculo/buscar-cursos-da-unidade', {params: {unidadeId}});

            const todosCursos = curriculosQuery.data ?? [];

            setCurriculosDetalhe(todosCursos.filter((c) => idsCursos.data.includes(c.id)));

            setCursosDaUnidade(toOptions(

                todosCursos.filter((c) => idsCursos.data.includes(c.id)) as unknown as Array<Record<string, unknown>>,

                ['descricao', 'sucinto', 'sigla'],

            ));

        } catch {

            setCursosDaUnidade([]);

            setCurriculosDetalhe([]);

        }

        try {

            const idsSalas = await api.get<number[]>('/api/educacao/sala/buscar-salas-da-unidade', {params: {unidadeId}});

            const todasSalas = salasQuery.data ?? [];

            const filtradas = todasSalas.filter((s) => idsSalas.data.includes(s.id));

            setSalasDetalhe(filtradas);

            setSalasDaUnidade(toOptions(

                filtradas.map((s) => ({...s, label: s.numero ? `Sala ${s.numero}` : s.sucinto || s.descricao || `#${s.id}`})) as unknown as Array<Record<string, unknown>>,

                ['label'],

            ));

        } catch {

            setSalasDaUnidade([]);

            setSalasDetalhe([]);

        }

    }, [curriculosQuery.data, salasQuery.data]);



    useEffect(() => {

        if (data.unidadeId) void carregarCatalogosUnidade(data.unidadeId);

    }, [data.unidadeId, carregarCatalogosUnidade]);



    const montarTurmasPorMatriz = useCallback(async (curriculoId: number) => {

        try {

            const {data: matrizIds} = await api.get<number[]>('/api/educacao/oferecimento-componente-curricular/buscar-matriz-curricular', {params: {curriculoId}});

            const componentes = (componentesQuery.data ?? []).filter((c) => matrizIds.includes(c.id));

            setTurmas(componentes.map((c) => ({

                componenteCurricularId: c.id,

                descricao: c.sucinto || c.descricao || `#${c.id}`,

                cargaHoraria: c.cargaHoraria ?? 0,

                ocorrencias: [],

            })));

        } catch {

            setTurmas([]);

        }

    }, [componentesQuery.data]);



    useEffect(() => {

        if (hidratadoRef.current && !emEdicao && data.curriculoId) {

            void montarTurmasPorMatriz(data.curriculoId);

            setDatasInvalidas([]);

        }

    }, [data.curriculoId, emEdicao, montarTurmasPorMatriz]);



useEffect(() => {

        if (!emEdicao || hidratadoRef.current) return;

        // Aguarda catálogos (edc_oferecimento_dias_aula depende deles p/ rótulos e turmas);
        // sem isso a edição hidratava com listas vazias e a aba "Dias de Aula" vinha vazia.
        if (curriculosQuery.isLoading || salasQuery.isLoading || componentesQuery.isLoading) return;

        hidratadoRef.current = true;

        (async () => {

            try {

                const {data: detalhe} = await api.get<{curso: GrupoRow; oferecimentos: OferecimentoTurmaApi[]}>('/api/educacao/oferecimento-curso/detalhe', {params: {id}});

                const curso = detalhe.curso;

                let ofs = detalhe.oferecimentos ?? [];

                // "ordem" vem da tela de listagem quando o usuário escolhe oferecimentos
                // (com ordem: inicio do oferecimento, listagem da tabela ou conforme seleção).
                const ordemParam = searchParams.get('ordem');

                if (ordemParam) {

                    const idsOrdem = ordemParam.split(',').map(s => Number(s.trim())).filter(n => !Number.isNaN(n) && n > 0);

                    const porId = new Map(ofs.map(o => [Number(o.id), o] as const));

                    ofs = idsOrdem.map(oid => porId.get(oid)).filter((o): o is OferecimentoTurmaApi => o !== undefined);

                }

                const primeiro = ofs[0] ?? {};



                // Load diasAula from backend (new endpoint)

                let diasAulaLoaded: Array<{diaSemanaId: number; turnoEducacaoId: number; tempoAulaId: number}> = [];

                try {

                    const {data: diasAulaData} = await api.get<Array<{diaSemanaId: number; turnoEducacaoId: number; tempoAulaId: number}>>('/api/educacao/oferecimento-componente-curricular/buscar-dias-aula-por-grupo', {params: {grupoId: curso.id}});

                    diasAulaLoaded = (diasAulaData ?? []).map((d) => ({

                    diaSemanaId: d.diaSemanaId,

                    turnoEducacaoId: d.turnoEducacaoId,

                    tempoAulaId: d.tempoAulaId,

                }));

                } catch (e) {

                    console.warn('Falha ao carregar dias-aula por grupo, reconstruindo via ocorrencias', e);

                    diasAulaLoaded = [];

                }



                // Load ocorrencias for each turma (new endpoint with full objects)

                let ocorrenciasPorTurma: Record<number, OcorrenciaItem[]> = {};

                // Reconstruir os dias de aula a partir das ocorrências persistidas quando o

                // grupo não retornar os dias (join table vazia), garantindo a pré-visualização

                // correta das aulas ao editar.

                let diasAulaFinal = [...diasAulaLoaded];

                try {

                    const {data: ocorrenciasData} = await api.get<Array<{

                        id: number;

                        oferecimentoComponenteCurricularId: number;

                        data: string;

                        diaAulaId: number;

                        aulaPresencial: boolean;

                        diaSemanaId: number;

                        turnoEducacaoId: number;

                        tempoAulaId: number;

                    }>>('/api/educacao/ocorrencia-componente-curricular/buscar-ocorrencia-por-oferecimento-com-grupo-completo', {params: {grupoId: curso.id}});



                    if (ocorrenciasData && diasAulaFinal.length === 0) {

                        const vistos = new Set<string>();

                        for (const occ of ocorrenciasData) {

                            if (occ.diaSemanaId == null || occ.turnoEducacaoId == null || occ.tempoAulaId == null) continue;

                            const key = `${occ.diaSemanaId}-${occ.turnoEducacaoId}-${occ.tempoAulaId}`;

                            if (vistos.has(key)) continue;

                            vistos.add(key);

                            diasAulaFinal.push({diaSemanaId: occ.diaSemanaId, turnoEducacaoId: occ.turnoEducacaoId, tempoAulaId: occ.tempoAulaId});

                        }

                    }



                    // Map offering ID -> componenteCurricularId

                    const ofertaIdParaCompId: Record<number, number> = {};

                    ofs.forEach((o) => {

                        if (o.id && o.componenteCurricularId) {

                            ofertaIdParaCompId[o.id] = o.componenteCurricularId;

                        }

                    });



                    // Map diaAula (diaSemanaId-turnoEducacaoId-tempoAulaId) -> index in diasAulaFinal

                    const diaAulaKeyParaIndex: Record<string, number> = {};

                    diasAulaFinal.forEach((d, idx) => {

                        const key = `${d.diaSemanaId}-${d.turnoEducacaoId}-${d.tempoAulaId}`;

                        diaAulaKeyParaIndex[key] = idx;

                    });



                    if (ocorrenciasData) {

                        ocorrenciasPorTurma = ocorrenciasData.reduce((acc, occ) => {

                            const compId = ofertaIdParaCompId[occ.oferecimentoComponenteCurricularId];

                            if (!compId) return acc;



                            // Find diaAula index by matching diaSemanaId, turnoEducacaoId, tempoAulaId from response

                            const occDiaAulaKey = `${occ.diaSemanaId}-${occ.turnoEducacaoId}-${occ.tempoAulaId}`;

                            const diaAulaIndex = diaAulaKeyParaIndex[occDiaAulaKey] ?? 0;



                            if (!acc[compId]) acc[compId] = [];

                            acc[compId].push({

                                key: occ.id.toString(),

                                componenteCurricularId: compId,

                                data: occ.data,

                                diaAulaIndex,

                                aulaPresencial: occ.aulaPresencial ?? true,

                            });

                            return acc;

                        }, {} as Record<number, OcorrenciaItem[]>);

                    }

                } catch {}



                // Load salas and cursos for the unidade

                if (curso.unidadeId) {

                    try {

                        const idsCursos = await api.get<number[]>('/api/educacao/curriculo/buscar-cursos-da-unidade', {params: {unidadeId: curso.unidadeId}});

                        const todosCursos = curriculosQuery.data ?? [];

                        setCurriculosDetalhe(todosCursos.filter((c) => idsCursos.data.includes(c.id)));

                        setCursosDaUnidade(toOptions(

                            todosCursos.filter((c) => idsCursos.data.includes(c.id)) as unknown as Array<Record<string, unknown>>,

                            ['descricao', 'sucinto', 'sigla'],

                        ));

                    } catch {}

                    try {

                        const idsSalas = await api.get<number[]>('/api/educacao/sala/buscar-salas-da-unidade', {params: {unidadeId: curso.unidadeId}});

                        const todasSalas = salasQuery.data ?? [];

                        const filtradas = todasSalas.filter((s) => idsSalas.data.includes(s.id));

                        setSalasDetalhe(filtradas);

                        setSalasDaUnidade(toOptions(

                            filtradas.map((s) => ({...s, label: s.numero ? `Sala ${s.numero}` : s.sucinto || s.descricao || `#${s.id}`})) as unknown as Array<Record<string, unknown>>,

                            ['label'],

                        ));

                    } catch {}

                }



                setData({

                    novoGrupo: false,

                    grupoId: curso.id,

                    grupoNome: curso.nome ?? '',

                    unidadeId: curso.unidadeId ?? null,

                    curriculoId: curso.curriculoId ?? null,

                    registraFrequencia: primeiro.registraFrequencia ?? false,

                    possuiAvaliacao: primeiro.possuiAvaliacao ?? true,

                    replicar: primeiro.replicar ?? false,

                    dataCancelamento: isoDate(primeiro.dataCancelamento),

                    dataFim: isoDate(primeiro.dataFim),

                    salaId: primeiro.salaId ?? null,

                    vagas: primeiro.vagas ?? 0,

                    qtdeSequencia: primeiro.qtdeSequencia ?? 0,

                    dataInicio: isoDate(primeiro.dataInicio),

                    diasAula: diasAulaFinal,

                    novoDiaDiaSemana: null,

                    novoDiaTurno: null,

                    novoDiaTempoAula: null,

                    professores: Object.fromEntries(ofs.map((o) => [String(o.componenteCurricularId), o.professorId ?? 0])),

                    responsaveis: [],

                    criterio: null,

                });

                setTurmas(ofs.map((o) => ({

                    componenteCurricularId: o.componenteCurricularId ?? 0,

                    descricao: o.componenteCurricular_descricao ?? `#${o.componenteCurricularId}`,

                    cargaHoraria: (componentesQuery.data ?? []).find((c) => c.id === o.componenteCurricularId)?.cargaHoraria ?? 0,

                    turmaId: o.id,

                    ocorrencias: ocorrenciasPorTurma[o.componenteCurricularId ?? 0] ?? [],

                    professorId: o.professorId ?? undefined,

                })));



                // Check for inconsistent values across offerings

                const checkInconsistencies = () => {

                    const fieldsToCheck = ['salaId', 'vagas', 'qtdeSequencia', 'dataCancelamento', 'dataFim', 'registraFrequencia', 'possuiAvaliacao'] as const;

                    const inconsistencies: string[] = [];



                    for (const field of fieldsToCheck) {

                        const values = new Set(ofs.map(o => {

                            const val = o[field];

                            return val === undefined || val === null ? 'null' : String(val);

                        }));

                        if (values.size > 1) {

                            inconsistencies.push(field);

                        }

                    }



                    if (inconsistencies.length > 0) {

                        setMensagem(`Atenção: As turmas deste grupo têm valores diferentes para: ${inconsistencies.join(', ')}. O formulário usa os valores da primeira turma.`);

                    }

                };

                checkInconsistencies();

            } catch {

                setErro('Não foi possível carregar o oferecimento para edição.');

            }

        })();

    }, [emEdicao, id, searchParams, curriculosQuery.isLoading, salasQuery.isLoading, componentesQuery.isLoading, curriculosQuery.data, salasQuery.data, componentesQuery.data]);



    const buscarCriterios = useCallback(async () => {

        if (!data.unidadeId || !data.curriculoId) {

            setData(prev => ({...prev, criterio: null}));

            return;

        }

        try {

            const {data: ids} = await api.get<number[]>('/api/educacao/criterio/buscar-criterio', {params: {unidadeId: data.unidadeId, curriculoId: data.curriculoId}});

            if (ids && ids.length > 0) {

                const {data: criterio} = await api.get<{qtdTurmaAbertas?: number; dataInicio?: string; dataFim?: string; periodo?: number}>(`/api/educacao/criterio/${ids[0]}`);

                setData(prev => ({...prev, criterio: criterio}));

            } else {

                setData(prev => ({...prev, criterio: null}));

            }

        } catch {

            setData(prev => ({...prev, criterio: null}));

        }

    }, [data.unidadeId, data.curriculoId]);



    useEffect(() => {

        if (data.unidadeId && data.curriculoId) {

            buscarCriterios();

        }

    }, [data.unidadeId, data.curriculoId, buscarCriterios]);



    const minutosTurno = useCallback((turnoEducacaoId: number): number => {

        const turno = (turnosQuery.data ?? []).find((t) => t.id === turnoEducacaoId);

        const inicio = parseHoraMinutos(turno?.inicio);

        const fim = parseHoraMinutos(turno?.fim);

        if (inicio === null || fim === null || fim <= inicio) return 0;

        return fim - inicio;

    }, [turnosQuery.data]);



    const minutosTempo = useCallback((tempoAulaId: number): number => {

        const tempo = (temposAulaQuery.data ?? []).find((t) => t.id === tempoAulaId);

        return tempo?.minutos || tempo?.minutosAula || 0;

    }, [temposAulaQuery.data]);



    const gerarPreview = useCallback(() => {

        if (!data.dataInicio || data.diasAula.length === 0) {

            // Em edição, preserva as aulas (ocorrências) já persistidas no banco em vez de

            // apagá-las quando ainda não há data inicial/dias de aula informados.

            if (!emEdicao) {

                setTurmas((prev) => prev.map((t) => ({...t, ocorrencias: []})));

            }

            return;

        }

        const invalidas: DataInvalidaItem[] = [];

        let inicioMs = new Date(`${data.dataInicio}T00:00:00`).getTime();



        setTurmas((prev) => prev.map((turma) => {

            const horasSemana = data.diasAula.reduce((acc, d) => acc + (minutosTempo(d.tempoAulaId) > 0 ? minutosTurno(d.turnoEducacaoId) / minutosTempo(d.tempoAulaId) : 0), 0);

            if (horasSemana <= 0 || turma.cargaHoraria <= 0) {

                return {...turma, ocorrencias: []};

            }

            const mediaHorasDia = horasSemana / data.diasAula.length;

            const quantidadeAulas = Math.ceil(turma.cargaHoraria / mediaHorasDia);



            const ocorrencias: OcorrenciaItem[] = [];

            let calculoDia = 1;

            let salvaguarda = 0;

            let cursor = inicioMs;

            while (calculoDia <= quantidadeAulas && salvaguarda < 2000) {

                salvaguarda++;

                const jsWeekday = new Date(cursor).getDay();

                const diaSemanaId = DIA_SEMANA_JS_PARA_ID[jsWeekday];

                const indice = data.diasAula.findIndex((d) => d.diaSemanaId === diaSemanaId);

                if (indice >= 0) {

                    const dataIso = new Date(cursor).toISOString().slice(0, 10);

                    ocorrencias.push({

                        key: `${turma.componenteCurricularId}-${calculoDia}-${dataIso}`,

                        componenteCurricularId: turma.componenteCurricularId,

                        data: dataIso,

                        diaAulaIndex: indice,

                        aulaPresencial: true,

                    });

                    calculoDia++;

                }

                cursor += 86400000;

            }

            if (calculoDia <= quantidadeAulas) {

                invalidas.push({data: brDate(new Date(cursor - 86400000).toISOString().slice(0, 10)), motivo: `Não foi possível gerar todas as aulas de ${turma.descricao} na janela de busca.`});

            }

            return {...turma, ocorrencias};

        }));



        const contagem = new Map<string, number>();

        for (const d of data.diasAula) {

            for (let i = 0; i < 7; i++) {

                const js = new Date(inicioMs + i * 86400000).getDay();

                if (DIA_SEMANA_JS_PARA_ID[js] === d.diaSemanaId) {

                    const chave = new Date(inicioMs + i * 86400000).toISOString().slice(0, 10);

                    contagem.set(chave, (contagem.get(chave) ?? 0));

                }

            }

        }

        setDatasInvalidas(invalidas);

    }, [data.dataInicio, data.diasAula, minutosTempo, minutosTurno, emEdicao]);



    useEffect(() => {

        gerarPreview();

    }, [gerarPreview]);



    const popularVagasPorSala = (salaId: number) => {

        const sala = salasDetalhe.find((s) => s.id === salaId);

        const curriculo = curriculosDetalhe.find((c) => c.id === data.curriculoId);

        const qtdMaxima = curriculo?.qtd_maxima_alunos ?? 0;

        const quantidadeAlunos = sala?.qtd_alunos ?? 0;

        let vagas = 0;

        if (quantidadeAlunos > 0) {

            vagas = qtdMaxima === 0 || quantidadeAlunos < qtdMaxima ? quantidadeAlunos : qtdMaxima;

        }

        updateField('vagas', vagas);

    };



    const adicionarDiaAula = () => {

        const {novoDiaDiaSemana, novoDiaTurno, novoDiaTempoAula, diasAula} = data;

        if (!novoDiaDiaSemana || !novoDiaTurno || !novoDiaTempoAula) {

            setMensagem('Informe dia da semana, turno da aula e tempo de aula.');

            return;

        }

        if (diasAula.some((d) => d.diaSemanaId === novoDiaDiaSemana && d.turnoEducacaoId === novoDiaTurno && d.tempoAulaId === novoDiaTempoAula)) {

            setMensagem('Este Dia da Semana com o turno e tempo já existe.');

            return;

        }

        setMensagem(null);

        updateFields({

            diasAula: [...diasAula, {diaSemanaId: novoDiaDiaSemana, turnoEducacaoId: novoDiaTurno, tempoAulaId: novoDiaTempoAula}],

            novoDiaDiaSemana: null,

            novoDiaTurno: null,

            novoDiaTempoAula: null,

        });

    };



    const removerDiaAula = (indice: number) => {

        updateFields({diasAula: data.diasAula.filter((_, i) => i !== indice)});

    };



    const removerTodosDiasAula = () => {

        updateFields({diasAula: []});

    };



    const alterarDataOcorrencia = (componenteId: number, chave: string, novaData: string) => {

        const conflito = turmas.some((t) => t.ocorrencias.some((o) => o.key !== chave && o.data === novaData));

        if (conflito) {

            setDatasInvalidas((prev) => [...prev, {data: brDate(novaData), motivo: 'Já existe aula deste grupo nesta data.'}]);

            return;

        }

        setTurmas((prev) => prev.map((t) => t.componenteCurricularId !== componenteId ? t : ({

            ...t,

            ocorrencias: t.ocorrencias.map((o) => o.key === chave ? {...o, data: novaData} : o),

        })));

    };



    const alternarPresencial = (componenteId: number, chave: string) => {

        setTurmas((prev) => prev.map((t) => t.componenteCurricularId !== componenteId ? t : ({

            ...t,

            ocorrencias: t.ocorrencias.map((o) => o.key === chave ? {...o, aulaPresencial: !o.aulaPresencial} : o),

        })));

    };



    const definirProfessor = (componenteId: number, professorId: number) => {

        setData(prev => ({...prev, professores: {...prev.professores, [String(componenteId)]: professorId}}));

        setTurmas(prev => prev.map(t => t.componenteCurricularId === componenteId ? {...t, professorId} : t));

    };



    const fetchUsuarioResponsavel = async (query: string): Promise<AutoCompleteOption[]> => {

        if (query.length < 2) return [];

        const {data: rows} = await api.get<Array<Record<string, unknown>>>('/api/view/usuario/listUsuario', {params: {q: query, limit: 20}});

        return toOptions(rows, ['nome', 'login']);

    };



    const fetchProfessor = async (query: string, diaSemanaId?: number, turnoId?: number, tempoAulaId?: number): Promise<AutoCompleteOption[]> => {

        if (query.length < 3) return [];

        const params: Record<string, string | number> = {query};

        if (diaSemanaId) params.diaSemanaId = diaSemanaId;

        if (turnoId) params.turnoId = turnoId;

        if (tempoAulaId) params.tempoAulaId = tempoAulaId;

        try {
            const {data: rows} = await api.get<Array<{id: number; nome: string}>>('/api/professor/professor/auto-complete-professor', {params});
            let filtered = (rows ?? []).map((p) => ({id: Number(p.id), label: p.nome || `#${p.id}`}));
            return filtered;
        } catch (err) {
            console.warn('Erro ao buscar professores (auto-complete):', err);
            return [];
        }
    };

    const fetchProfessorById = async (id: number): Promise<AutoCompleteOption | null> => {
        try {
            const {data} = await api.get(`/api/professor/professor/${id}`);

        return {id: data.id, label: data.nome};
        } catch (err) {
            console.warn('Erro ao buscar professor por ID:', err);
            return null;
        }
    };

    const consultarOferecimentos = async () => {

        if (!data.grupoId) {

            setMensagem('Selecione ou informe um grupo antes de consultar os oferecimentos.');

            return;

        }

        try {

            const {data: ofs} = await api.get<OferecimentoTurmaApi[]>('/api/educacao/oferecimento-curso/listar-oferecimentos', {params: {grupoId: data.grupoId}});

            setOferecimentosConsulta(ofs ?? []);

            setDialogOferecimentos(true);

        } catch {

            setErro('Não foi possível consultar os oferecimentos.');

        }

    };



    const validateTab = (targetTab: TabKey): boolean => {

        if (targetTab === 'tabDiaAula') {

            if (!data.unidadeId) { setMensagem('Selecione a unidade'); return false; }

            if (!data.curriculoId) { setMensagem('Selecione o curso'); return false; }

            if (data.novoGrupo) {

                if (!data.grupoNome?.trim()) { setMensagem('Informe o nome do grupo'); return false; }

            } else if (!data.grupoId) { setMensagem('Selecione o grupo'); return false; }

        }

        if (targetTab === 'tabProfessor') {

            if (data.vagas <= 0) { setMensagem('O número de vagas não pode ser 0.'); return false; }

            if (data.diasAula.length === 0) { setMensagem('Marque pelo menos um Dia da Semana.'); return false; }

            if (!data.dataInicio) { setMensagem('Informe uma data para criar os dias de aula.'); return false; }

            const semAulas = turmas.every((t) => t.ocorrencias.length === 0);

            if (semAulas) { setMensagem('Defina os dias de aula'); return false; }

        }

        setMensagem(null);

        return true;

    };



    const handleTabChange = (newTab: TabKey) => {

        const tabOrder: TabKey[] = ['tabGrupo', 'tabDiaAula', 'tabProfessor'];

        const currentIndex = tabOrder.indexOf(activeTab);

        const newIndex = tabOrder.indexOf(newTab);

        

        if (newIndex > currentIndex) {

            for (let i = currentIndex + 1; i <= newIndex; i++) {

                if (!validateTab(tabOrder[i])) return;

            }

        }

        setActiveTab(newTab);

    };



    const resolverDiaAulaIds = async (): Promise<number[]> => {

        const {data: existentes} = await api.get<DiaAulaRowApi[]>('/api/educacao/dia-aula');

        const ids: number[] = [];

        for (const item of data.diasAula) {

            const encontrado = (existentes ?? []).find((d) =>

                d.diaSemanaId === item.diaSemanaId && d.turnoEducacaoId === item.turnoEducacaoId && d.tempoAulaId === item.tempoAulaId);

            if (encontrado) {

                ids.push(encontrado.id);

            } else {

                const {data: criado} = await api.post<DiaAulaRowApi>('/api/educacao/dia-aula', item);

                ids.push(criado.id);

            }

        }

        return ids;

    };



    const salvar = async () => {

        setErro(null);

        setMensagem(null);

        setSalvando(true);

        try {

            let grupoIdAtual = data.grupoId ?? 0;

            if (data.novoGrupo || !grupoIdAtual) {

                const {data: grupoCriado} = await api.post<GrupoRow>('/api/educacao/oferecimento-curso', {

                    unidadeId: data.unidadeId,

                    curriculoId: data.curriculoId,

                    nome: data.grupoNome.trim(),

                });

                grupoIdAtual = grupoCriado.id;

            } else if (emEdicao) {

                await api.put(`/api/educacao/oferecimento-curso/${grupoIdAtual}`, {

                    unidadeId: data.unidadeId,

                    curriculoId: data.curriculoId,

                    nome: data.grupoNome.trim(),

                });

            }



            for (const turma of turmas) {

                const payload: Record<string, unknown> = {

                    unidadeId: data.unidadeId,

                    periodoId: null,

                    grupoId: grupoIdAtual,

                    salaId: data.salaId,

                    curriculoId: data.curriculoId,

                    componenteCurricularId: turma.componenteCurricularId,

                    professorId: data.professores[String(turma.componenteCurricularId)] || null,

                    vagas: data.vagas,

                    qtdeSequencia: data.qtdeSequencia,

                    registraFrequencia: data.registraFrequencia,

                    possuiAvaliacao: data.possuiAvaliacao,

                    replicar: data.novoGrupo ? data.replicar : false,

                    dataCancelamento: emEdicao && data.dataCancelamento ? data.dataCancelamento : null,

                    dataFim: emEdicao && data.dataFim ? data.dataFim : null,

                    tipoPlanejamento: 'AULA',

                    sequencia: 1,

                };

                if (turma.turmaId) {

                    await api.put(`/api/educacao/oferecimento-componente-curricular/${turma.turmaId}`, payload);

                } else {

                    const {data: criada} = await api.post<{id: number}>('/api/educacao/oferecimento-componente-curricular', payload);

                    turma.turmaId = criada.id;

                }

            }



            if (data.diasAula.length > 0 && data.dataInicio) {

                const diaAulaIds = await resolverDiaAulaIds();

                const primeiroProfessor = Object.values(data.professores).find((p) => !!p) ?? null;

                await api.post('/api/educacao/oferecimento-curso/gerar-aula-curso-sequencia', {

                    grupoId: grupoIdAtual,

                    dataInicio: data.dataInicio,

                    diasAulaSelecionado: diaAulaIds,

                    salaId: data.salaId,

                    professorId: primeiroProfessor,

                });

            }



            setMensagem('Oferecimento de Curso salvo com sucesso!');

            setTimeout(() => navigate('/view/oferecimentoComponenteCurricular/listOferecimentoCurso'), 1200);

        } catch (e: any) {

            setErro(e?.response?.data?.message ?? e?.response?.data?.error ?? 'Erro ao salvar o Oferecimento de Curso.');

        } finally {

            setSalvando(false);

        }

    };



    const voltarLista = () => navigate('/view/oferecimentoComponenteCurricular/listOferecimentoCurso');



    const renderTabGrupo = () => (

        <section className="tab-content">

            <p className="step-description">

                {emEdicao

                    ? 'Edite os dados do oferecimento do curso.'

                    : 'Informe a unidade e o curso. Você pode criar uma nova sequência ou selecionar um grupo existente.'}

            </p>



            {!emEdicao && (

                <div className="field-row">

                    <label className="ofc-checkbox">

                        <BooleanField

                            value={data.novoGrupo}

                            disabled={(gruposDisponiveis.length === 0 && !data.novoGrupo)}

                            onChange={(checked) => updateFields({novoGrupo: checked, grupoId: null})}

                        />

                        Criar nova sequência

                    </label>

                </div>

            )}



            <div className="field-row">

                <div className="field-group">

                    <label htmlFor="ofc-grupo-nome">Grupo *</label>

                    {data.novoGrupo ? (

                        <input

                            id="ofc-grupo-nome"

                            className="form-input"

                            value={data.grupoNome}

                            placeholder="Nome do grupo / sequência"

                            onChange={(e) => updateField('grupoNome', e.target.value)}

                        />

                    ) : (

                        <select

                            id="ofc-grupo-nome"

                            className="form-input form-select"

                            value={data.grupoId ?? ''}

                            onChange={(e) => {

                                const selecionado = Number(e.target.value);

                                const grupo = gruposDisponiveis.find((g) => g.id === selecionado);

                                updateFields({

                                    grupoId: selecionado || null,

                                    grupoNome: grupo?.nome ?? '',

                                });

                            }}

                        >

                            <option value="">Selecione</option>

                            {gruposDisponiveis.map((g) => (

                                <option key={g.id} value={g.id}>{g.nome || `Grupo #${g.id}`}</option>

                            ))}

                        </select>

                    )}

                </div>

                <button type="button" className="btn-secondary ofc-btn-yellow" onClick={consultarOferecimentos}>

                    Consulte os Oferecimentos

                </button>

            </div>



            <div className="field-row">

                <div className="field-group">

                    <label htmlFor="ofc-unidade">Unidade *</label>

                    <select

                        id="ofc-unidade"

                        className="form-input form-select"

                        value={data.unidadeId ?? ''}

                        onChange={(e) => {

                            const unidadeId = Number(e.target.value) || null;

                            updateFields({unidadeId, curriculoId: null});

                            setCursosDaUnidade([]);

                            setSalasDaUnidade([]);

                        }}

                    >

                        <option value="">Selecione</option>

                        {unidades.map((u) => (

                            <option key={u.id} value={u.id}>{u.label}</option>

                        ))}

                    </select>

                </div>

                <div className="field-group">

                    <label htmlFor="ofc-curso">Curso *</label>

                    <select

                        id="ofc-curso"

                        className="form-input form-select"

                        value={data.curriculoId ?? ''}

                        disabled={!data.unidadeId}

                        onChange={(e) => updateField('curriculoId', Number(e.target.value) || null)}

                    >

                        <option value="">Selecione</option>

                        {cursosDaUnidade.map((c) => (

                            <option key={c.id} value={c.id}>{c.label}</option>

                        ))}

                    </select>

                </div>

            </div>



            {emEdicao && (

                <>

                    <div className="field-row">

                        <label className="ofc-toggle">

                            <input
                                type="radio"
                                name="registraFrequencia"
                                checked={data.entity?.registraFrequencia !== false}
                                onChange={() => updateField('entity', {...dataRef.current.entity, registraFrequencia: !data.entity?.registraFrequencia})}

                            /> Sim</label>

                        <label className="ofc-toggle">

                            <input
                                type="radio"
                                name="possuiAvaliacao"
                                checked={data.entity?.possuiAvaliacao !== false}
                                onChange={() => updateField('entity', {...dataRef.current.entity, possuiAvaliacao: !data.entity?.possuiAvaliacao})}

                            /> Sim</label>

                    </div>

                    <div className="field-row">

                        <div className="field-group">

                            <label htmlFor="ofc-data-cancelamento" title="Após esta data se a turma continuar pendente ela será cancelada">

                                Data Cancelamento

                            </label>

                            <input

                                id="ofc-data-cancelamento"

                                type="date"

                                className="form-input"

                                value={data.dataCancelamento}

                                onChange={(e) => updateField('dataCancelamento', e.target.value)}

                            />

                        </div>

                        <div className="field-group">

                            <label htmlFor="ofc-data-fim">Data Fim</label>

                            <input

                                id="ofc-data-fim"

                                type="date"

                                className="form-input"

                                value={data.dataFim}

                                onChange={(e) => updateField('dataFim', e.target.value)}

                            />

                        </div>

                    </div>

                </>

            )}



            {!emEdicao && (

                <div className="field-row">

                    <div className="field-group">

                        <label htmlFor="ofc-replicar">Replicar</label>

                        <select

                            id="ofc-replicar"

                            className="form-input form-select"

                            value={data.replicar ? 'sim' : 'nao'}

                            onChange={(e) => updateField('replicar', e.target.value === 'sim')}

                        >

                            <option value="nao">Não</option>

                            <option value="sim">Sim</option>

                        </select>

                    </div>

                </div>

            )}



            {data.curriculoId && (

                <div className="field-row">

                    <div className="field-group">

                        <label>Critério de Curso</label>

                        <div className="ofc-hint">

                            {data.criterio ? (

                                <>

                                    Turmas máximas abertas: {data.criterio.qtdTurmaAbertas ?? 'Não definido'}<br />

                                    Período: {data.criterio.periodo ?? 'Não definido'}<br />

                                    {data.criterio.dataInicio && `Início válido a partir de: ${brDate(data.criterio.dataInicio)}`}<br />

                                    {data.criterio.dataFim && `Término até: ${brDate(data.criterio.dataFim)}`}

                                </>

                            ) : (

                                'Nenhum critério específico definido para esta unidade/curso.'

                            )}

                        </div>

                    </div>

                </div>

            )}



            <div className="field-row">

                <AutoComplete

                    id="ofc-responsavel"

                    label="Responsável"

                    placeholder="Digite para buscar o usuário..."

                    value={null}

                    onChange={(opt) => {

                        if (opt && !data.responsaveis.some((r) => r.id === opt.id)) {

                            updateField('responsaveis', [...data.responsaveis, opt]);

                        }

                    }}

                    fetchOptions={fetchUsuarioResponsavel}

                    minChars={2}

                />

                <div className="ofc-chips">

                    {data.responsaveis.length === 0 && <span className="ofc-chips-vazio">Nenhum responsável adicionado.</span>}

                    {data.responsaveis.map((r) => (

                        <span key={r.id} className="ofc-chip">

                            {r.label}

                            <button

                                type="button"

                                className="ofc-btn-remove"

                                style={{color: '#dc3545'}}

                                title="Remover"

                                onClick={() => updateField('responsaveis', data.responsaveis.filter((x) => x.id !== r.id))}

                            >

                                <X className="icon" />

                            </button>

                        </span>

                    ))}

                </div>

            </div>

        </section>

    );



    const renderTabDiaAula = () => {

        const salaSelecionada = salasDetalhe.find((s) => s.id === data.salaId);

        return (

            <section className="tab-content">

                <p className="step-description">

                    Defina sala, vagas, data inicial e os dias de aula (dia da semana, turno e tempo).

                    As aulas são geradas automaticamente por componente curricular.

                </p>



                <div className="field-row">

                    <div className="field-group">

                        <label htmlFor="ofc-sala">Sala</label>

                        <div style={{display: 'flex', gap: '8px', alignItems: 'flex-end'}}>

                            <select

                                id="ofc-sala"

                                className="form-input form-select"

                                style={{flex: 1}}

                                value={data.salaId ?? ''}

                                onChange={(e) => {

                                    const salaId = Number(e.target.value) || null;

                                    updateField('salaId', salaId);

                                    if (salaId) popularVagasPorSala(salaId);

                                }}

                            >

                                <option value="">Selecione</option>

                                {salasDaUnidade.map((s) => (

                                    <option key={s.id} value={s.id}>{s.label}</option>

                                ))}

                            </select>

                            <button

                                type="button"

                                className="btn-secondary ofc-btn-yellow"

                                title="Disponibilidade da Sala"

                                onClick={() => {
                                    if (!data.unidadeId || !data.salaId) {
                                        alert('Selecione uma unidade e uma sala primeiro');
                                        return;
                                    }
                                    setDisponibilidadeUnidadeId(data.unidadeId);
                                    setDisponibilidadeSalaId(data.salaId);
                                    setDisponibilidadeModalOpen(true);
                                }}
                            >

                                Disponibilidade

                            </button>

                        </div>

                    </div>

                    <div className="field-group">

                        <label htmlFor="ofc-qtde-sequencia">Qtde Sequência</label>

                        <input

                            id="ofc-qtde-sequencia"

                            type="number"

                            min={0}

                            step={1}

                            className="form-input"

                            value={data.qtdeSequencia}

                            onChange={(e) => updateField('qtdeSequencia', Math.max(0, Number(e.target.value)))}

                        />

                    </div>

                    <div className="field-group">

                        <label htmlFor="ofc-vagas">Inscritos / Vagas *</label>

                        <input

                            id="ofc-vagas"

                            type="number"

                            min={0}

                            className="form-input"

                            value={data.vagas}

                            onChange={(e) => updateField('vagas', Math.max(0, Number(e.target.value)))}

                        />

                    </div>

                    <div className="field-group">

                        <label htmlFor="ofc-data-inicio">Data Inicial *</label>

                        <input

                            id="ofc-data-inicio"

                            type="date"

                            className="form-input"

                            value={data.dataInicio}

                            onChange={(e) => updateField('dataInicio', e.target.value)}

                        />

                    </div>

                </div>



                <fieldset className="form-fieldset">

                    <legend>Dias de Aula</legend>

                    <div className="field-row">

                        <div className="field-group">

                            <label htmlFor="ofc-dia-semana">Dia da Semana</label>

                            <select

                                id="ofc-dia-semana"

                                className="form-input form-select"

                                value={data.novoDiaDiaSemana ?? ''}

                                onChange={(e) => updateField('novoDiaDiaSemana', Number(e.target.value) || null)}

                            >

                                <option value="">Selecione</option>

                                {(diasSemanaQuery.data ?? []).map((d) => (

                                    <option key={d.id} value={d.id}>{d.nome || `#${d.id}`}</option>

                                ))}

                            </select>

                        </div>

                        <div className="field-group">

                            <label htmlFor="ofc-turno">Turno Aula</label>

                            <select

                                id="ofc-turno"

                                className="form-input form-select"

                                value={data.novoDiaTurno ?? ''}

                                onChange={(e) => updateField('novoDiaTurno', Number(e.target.value) || null)}

                            >

                                <option value="">Selecione</option>

                                {(turnosQuery.data ?? []).map((t) => (

                                    <option key={t.id} value={t.id}>{t.descricao || t.sucinto || `#${t.id}`}</option>

                                ))}

                            </select>

                        </div>

                        <div className="field-group">

                            <label htmlFor="ofc-tempo-aula">Tempo Aula</label>

                            <select

                                id="ofc-tempo-aula"

                                className="form-input form-select"

                                value={data.novoDiaTempoAula ?? ''}

                                onChange={(e) => updateField('novoDiaTempoAula', Number(e.target.value) || null)}

                            >

                                <option value="">Selecione tempo da aula</option>

                                {(temposAulaQuery.data ?? []).map((t) => (

                                    <option key={t.id} value={t.id}>{t.descricao || `#${t.id}`}</option>

                                ))}

                            </select>

                        </div>

                        <div className="field-group ofc-field-actions">

                            <button type="button" className="btn-primary" onClick={adicionarDiaAula}>Adicionar</button>

                            <button type="button" className="btnred" style={{backgroundColor: '#e53935', borderColor: '#e53935', color: '#fff'}} onClick={removerTodosDiasAula}

                                    disabled={data.diasAula.length === 0}>

                                Remover todos

                            </button>

                        </div>

                    </div>



                    {data.diasAula.length > 0 ? (

                        <table className="ofc-table ofc-table-dias">

                            <thead>

                            <tr>

                                <th>Dia da Semana</th>

                                <th>Turno</th>

                                <th>Tempo Aula</th>

                                <th style={{width: 60}}></th>

                            </tr>

                            </thead>

                            <tbody>

                            {data.diasAula.map((item, indice) => {

                                const dia = (diasSemanaQuery.data ?? []).find((d) => d.id === item.diaSemanaId);

                                const turno = (turnosQuery.data ?? []).find((t) => t.id === item.turnoEducacaoId);

                                const tempo = (temposAulaQuery.data ?? []).find((t) => t.id === item.tempoAulaId);

                                return (

                                    <tr key={`${item.diaSemanaId}-${item.turnoEducacaoId}-${item.tempoAulaId}`}>

                                        <td>{dia?.nome || `#${item.diaSemanaId}`}</td>

                                        <td>{turno?.descricao || `#${item.turnoEducacaoId}`}</td>

                                        <td>{tempo?.descricao || `#${item.tempoAulaId}`}</td>

                                        <td>

                                            <button type="button" className="ofc-btn-remove" title="Remover"

                                                    onClick={() => removerDiaAula(indice)}><X className="icon" />

                                            </button>

                                        </td>

                                    </tr>

                                );

                            })}

                            </tbody>

                        </table>

                    ) : (

                        <p className="ofc-aviso">Marque pelo menos um Dia da Semana.</p>

                    )}

                </fieldset>



                <h3 className="ofc-subtitulo">Aulas Geradas por Componente Curricular</h3>

                {turmas.length === 0 && (

                    <p className="ofc-aviso">Selecione o curso na primeira etapa para listar os componentes curriculares.</p>

                )}

                {turmas.map((turma) => (

                    <div key={turma.componenteCurricularId} className="ofc-card">

                        <button

                            type="button"

                            className="ofc-card-header"

                            onClick={() => setExpandido(expandido === turma.componenteCurricularId ? null : turma.componenteCurricularId)}

                        >

                            <span className="ofc-card-toggle">{expandido === turma.componenteCurricularId ? <ChevronDown className="icon" /> : <ChevronRight className="icon" />}</span>

                            <span className="ofc-card-title">{turma.descricao}</span>

                            <span className="ofc-card-meta">

                                Carga horária: {turma.cargaHoraria}h · {turma.ocorrencias.length} aula(s)

                            </span>

                        </button>

                        {expandido === turma.componenteCurricularId && (

                            <table className="ofc-table">

                                <thead>

                                <tr>

                                    <th>Data</th>

                                    <th>Componente Curricular</th>

                                    <th>Sala</th>

                                    <th>Dia Semana</th>

                                    <th>Turno Aula</th>

                                    <th>Tempo Aula</th>

                                    <th>Aula Presencial</th>

                                </tr>

                                </thead>

                                <tbody>

                                {turma.ocorrencias.length === 0 && (

                                    <tr>

                                        <td colSpan={7} className="ofc-sem-registros">Nenhuma aula gerada.</td>

                                    </tr>

                                )}

                                {turma.ocorrencias.map((ocorrencia) => {

                                    const diaAula = data.diasAula[ocorrencia.diaAulaIndex];

                                    const dia = diaAula ? (diasSemanaQuery.data ?? []).find((d) => d.id === diaAula.diaSemanaId) : null;

                                    const turno = diaAula ? (turnosQuery.data ?? []).find((t) => t.id === diaAula.turnoEducacaoId) : null;

                                    const tempo = diaAula ? (temposAulaQuery.data ?? []).find((t) => t.id === diaAula.tempoAulaId) : null;

                                    return (

                                        <tr key={ocorrencia.key}>

                                            <td>

                                                <input

                                                    type="date"

                                                    className="form-input ofc-input-data"

                                                    value={ocorrencia.data}

                                                    onChange={(e) => alterarDataOcorrencia(turma.componenteCurricularId, ocorrencia.key, e.target.value)}

                                                />

                                                <span className="ofc-data-br">{brDate(ocorrencia.data)}</span>

                                            </td>

                                            <td>{turma.descricao}</td>

                                            <td>{salaSelecionada ? (salaSelecionada.numero ? `Sala ${salaSelecionada.numero}` : salaSelecionada.sucinto || '') : '-'}</td>

                                            <td>{dia?.nome || '-'}</td>

                                            <td>{turno?.descricao || '-'}{turno ? ` (${String(turno.inicio ?? '').slice(0, 5)} às ${String(turno.fim ?? '').slice(0, 5)})` : ''}</td>

                                            <td>{tempo?.descricao || '-'}</td>

                                            <td>

                                                <button

                                                    type="button"

                                                    className={`ofc-toggle ${ocorrencia.aulaPresencial ? 'ofc-toggle-on' : ''}`}

                                                    onClick={() => alternarPresencial(turma.componenteCurricularId, ocorrencia.key)}

                                                >

                                                    {ocorrencia.aulaPresencial ? 'Sim' : 'Não'}

                                                </button>

                                            </td>

                                        </tr>

                                    );

                                })}

                                </tbody>

                            </table>

                        )}

                    </div>

                ))}



                {datasInvalidas.length > 0 && (

                    <>

                        <h3 className="ofc-subtitulo ofc-subtitulo-erro">Datas Inválidas</h3>

                        <table className="ofc-table ofc-table-invalidas">

                            <thead>

                            <tr>

                                <th style={{width: 130}}>Data Inválida</th>

                                <th>Motivo</th>

                            </tr>

                            </thead>

                            <tbody>

                            {datasInvalidas.map((item, indice) => (

                                <tr key={`${item.data}-${indice}`}>

                                    <td>{item.data}</td>

                                    <td>{item.motivo}</td>

                                </tr>

                            ))}

                            </tbody>

                        </table>

                    </>

                )}

            </section>

        );

    };



    const renderTabProfessor = () => {

        const fetchProfessorFiltrado = useCallback((query: string) => {

            const firstDiaAula = data.diasAula[0];

            return fetchProfessor(query, firstDiaAula?.diaSemanaId, firstDiaAula?.turnoEducacaoId, firstDiaAula?.tempoAulaId);

        }, [data.diasAula, fetchProfessor]);



        return (

            <section className="tab-content">

                <div className="field-row" style={{marginBottom: '16px', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap'}}>

                    <button

                        type="button"

                        className="btn-secondary ofc-btn-yellow"

                        title="Disponibilidade do Professor selecionado"

                        disabled={!data.unidadeId || !Object.values(data.professores).find(p => p)}

                        onClick={() => {
                            const firstProfessorId = Object.values(data.professores).find(p => p);
                            if (!data.unidadeId) {
                                alert('Selecione uma unidade primeiro');
                                return;
                            }
                            if (!firstProfessorId) {
                                alert('Selecione um professor na tabela primeiro');
                                return;
                            }
                            const professorNome = Object.entries(data.professores)
                                .find(([, pid]) => pid === firstProfessorId)?.[0];
                            setSelectedProfessorId(firstProfessorId);
                            setSelectedProfessorNome(professorNome ?? 'Professor');
                            setProfessorAvailabilityOpen(true);
                        }}

                    >

                        Disponibilidade

                    </button>

                    <button

                        type="button"

                        className="btn-primary"

                        onClick={() => alert('Cadastro de professor - implementar modal de cadastro')}

                    >

                        Professor

                    </button>

                </div>

                <p className="step-description">Selecione os professores de cada Componente Curricular.</p>

                {turmas.length === 0 ? (

                    <p className="ofc-aviso">Nenhum componente curricular disponível. Volte e selecione o curso.</p>

                ) : (

                    <table className="ofc-table">

                        <thead>

                        <tr>

                            <th>Componente Curricular</th>

                            <th style={{width: '45%'}}>Professor</th>

                            <th style={{width: '120px', textAlign: 'center'}}>Ações</th>

                        </tr>

                        </thead>

                        <tbody>

                        {turmas.map((turma) => (

                            <tr key={turma.componenteCurricularId}>

                                <td>{turma.descricao}</td>

                                <td>

                                    <AutoComplete

                                        id={`ofc-professor-${turma.componenteCurricularId}`}

                                        placeholder="Digite para buscar o professor..."

                                        value={(() => {

                                            const pid = data.professores[String(turma.componenteCurricularId)];

                                            return pid ? {id: pid, label: ''} : null;

                                        })()}

                                        onChange={(opt) => definirProfessor(turma.componenteCurricularId, opt?.id ?? 0)}

                                        fetchOptions={fetchProfessorFiltrado}

                                        fetchById={fetchProfessorById}

                                        minChars={3}

                                    />

                                    {data.professores[String(turma.componenteCurricularId)] && (

                                        <span className="ofc-professor-chip">

                                            Professor ID: {data.professores[String(turma.componenteCurricularId)]}

                                        </span>

                                    )}

                                </td>

                                <td style={{textAlign: 'center', whiteSpace: 'nowrap'}}>

                                    <button

                                        type="button"

                                        className="btn-secondary ofc-btn-yellow"

                                        style={{padding: '4px 8px', fontSize: '12px'}}

                                        disabled={!data.professores[String(turma.componenteCurricularId)]}

                                        onClick={() => {

                                            const professorId = data.professores[String(turma.componenteCurricularId)];

                                            if (!professorId) return;

                                            setSelectedProfessorId(professorId);

                                            setSelectedProfessorNome(turma.descricao);

                                            setProfessorAvailabilityOpen(true);

                                        }}

                                    >

                                        Disponibilidade

                                    </button>

                                </td>

                            </tr>

                        ))}

                        </tbody>

                    </table>

                )}

            </section>

        );

    };



    return (

        <PermissionGate permission="READ">

            <main className="ofc-wizard-screen">

                <div className="page-header">

                    <div className="page-header-breadcrumb"><h1>Oferecimento de Curso</h1></div>

                    <div className="page-header-actions">

                        <button className="btnyellow" onClick={voltarLista}>Voltar</button>

                    </div>

                </div>



                {mensagem && <div className="data-table-notice ofc-notice">{mensagem}</div>}

                {erro && <div className="data-table-notice ofc-notice-erro">{erro}</div>}



                <div className="div_form">

                    <div className="form-title">{emEdicao ? `Editar Oferecimento de Curso${data.grupoNome ? ` — ${data.grupoNome}` : ''}` : 'Novo Oferecimento de Curso'}</div>

                    

                    <div className="ofc-tabs">

                        <nav className="ofc-tabs-nav" role="tablist" aria-label="Abas do oferecimento de curso">

                            {TABS.map((tab) => (

                                <button

                                    key={tab.key}

                                    type="button"

                                    role="tab"

                                    aria-selected={activeTab === tab.key}

                                    aria-controls={`panel-${tab.key}`}

                                    id={`tab-${tab.key}`}

                                    className={`ofc-tab ${activeTab === tab.key ? 'ofc-tab-active' : ''} ${tab.key !== activeTab && TABS.findIndex(t => t.key === activeTab) > TABS.findIndex(t => t.key === tab.key) ? 'ofc-tab-disabled' : ''}`}

                                    onClick={() => handleTabChange(tab.key)}

                                    disabled={bloquearProximo || salvando}

                                >

                                    {tab.label}

                                </button>

                            ))}

                        </nav>

                        

                        <div className="ofc-tabs-panels">

                            <div role="tabpanel" id="panel-tabGrupo" aria-labelledby="tab-tabGrupo" hidden={activeTab !== 'tabGrupo'}>

                                {renderTabGrupo()}

                            </div>

                            <div role="tabpanel" id="panel-tabDiaAula" aria-labelledby="tab-tabDiaAula" hidden={activeTab !== 'tabDiaAula'}>

                                {renderTabDiaAula()}

                            </div>

                            <div role="tabpanel" id="panel-tabProfessor" aria-labelledby="tab-tabProfessor" hidden={activeTab !== 'tabProfessor'}>

                                {renderTabProfessor()}

                            </div>

                        </div>



                        <div className="ofc-tabs-actions">

                            <button

                                type="button"

                                className="btn-form-back"

                                onClick={() => {

                                    const tabOrder: TabKey[] = ['tabGrupo', 'tabDiaAula', 'tabProfessor'];

                                    const currentIndex = tabOrder.indexOf(activeTab);

                                    if (currentIndex > 0) {

                                        setActiveTab(tabOrder[currentIndex - 1]);

                                    } else {

                                        voltarLista();

                                    }

                                }}

                                disabled={salvando}

                            >

                                Anterior

                            </button>

                            <button

                                type="button"

                                className="btn-form-save"

                                onClick={() => {

                                    const tabOrder: TabKey[] = ['tabGrupo', 'tabDiaAula', 'tabProfessor'];

                                    const currentIndex = tabOrder.indexOf(activeTab);

                                    if (currentIndex < tabOrder.length - 1) {

                                        handleTabChange(tabOrder[currentIndex + 1]);

                                    } else {

                                        void salvar();

                                    }

                                }}

                                disabled={salvando}

                            >

                                {salvando ? 'Salvando...' : activeTab === 'tabProfessor' ? 'Salvar' : 'Próximo'}

                            </button>

                        </div>

                    </div>

                </div>



                {dialogOferecimentos && (

                    <div className="modal-overlay" onClick={() => setDialogOferecimentos(false)}>

                        <div className="modal form-modal" onClick={(e) => e.stopPropagation()}>

                            <div className="div_form">

                                <div className="form-title">Oferecimentos Componente Curricular existentes</div>

                                <div className="table_form">

                                    <table className="ofc-table">

                                        <thead>

                                        <tr>

                                            <th>ID</th>

                                            <th>Componente Curricular</th>

                                            <th>Sala</th>

                                            <th>Professor</th>

                                            <th>Início</th>

                                            <th>Fim</th>

                                        </tr>

                                        </thead>

                                        <tbody>

                                        {oferecimentosConsulta.length === 0 && (

                                            <tr>

                                                <td colSpan={6} className="ofc-sem-registros">Nenhum oferecimento encontrado.</td>

                                            </tr>

                                        )}

                                        {oferecimentosConsulta.map((o) => (

                                            <tr key={o.id}>

                                                <td>{o.id}</td>

                                                <td>{o.componenteCurricular_descricao}</td>

                                                <td>{o.sala_descricao}</td>

                                                <td>{o.professor_descricao}</td>

                                                <td>{brDate(isoDate(o.dataInicio))}</td>

                                                <td>{brDate(isoDate(o.dataFim))}</td>

                                            </tr>

                                        ))}

                                        </tbody>

                                    </table>

                                    <div className="form-footer">

                                        <button type="button" className="btn-form-back" onClick={() => setDialogOferecimentos(false)}>

                                            Fechar

                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                )}

                <Modal
                    title="Disponibilidade de Sala"
                    open={disponibilidadeModalOpen}
                    onClose={() => setDisponibilidadeModalOpen(false)}
                    size="xl"
                >
                    <div className="disp-screens">
                        <div className="disp-filtros">
                            <div className="disp-filtro">
                                <label htmlFor="disp-sala-unidade-modal">Unidade</label>
                                <select
                                    id="disp-sala-unidade-modal"
                                    className="disp-select"
                                    value={disponibilidadeUnidadeId ?? ''}
                                    onChange={(e) => {
                                        const id = Number(e.target.value) || null;
                                        setDisponibilidadeUnidadeId(id);
                                        setDisponibilidadeSalaId(null);
                                    }}
                                >
                                    <option value="">Selecione a unidade</option>
                                    {(disponibilidadeUnidadesQuery.data ?? []).filter((u) => u.fl_ativo !== false).map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.nome_fantasia || u.razao_social || `Unidade ${u.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="disp-filtro">
                                <label htmlFor="disp-sala-modal">Sala</label>
                                <select
                                    id="disp-sala-modal"
                                    className="disp-select"
                                    value={disponibilidadeSalaId ?? ''}
                                    onChange={(e) => setDisponibilidadeSalaId(Number(e.target.value) || null)}
                                    disabled={!disponibilidadeUnidadeId}
                                >
                                    <option value="">Todas as salas</option>
                                    {(disponibilidadeSalasQuery.data ?? []).filter((s) => s.unidadeId === Number(disponibilidadeUnidadeId)).map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.numero != null ? `Sala ${s.numero}` : s.sucinto || s.descricao || `Sala ${s.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {!disponibilidadeUnidadeId && <p className="disp-aviso">Selecione uma unidade para visualizar a agenda semanal.</p>}
                        <ScheduleWeekView
                            startDate={disponibilidadeWeekStart}
                            onWeekChange={setDisponibilidadeWeekStart}
                            events={disponibilidadeEventosQuery.data ?? []}
                            loading={!!disponibilidadeUnidadeId && disponibilidadeEventosQuery.isLoading}
                            error={disponibilidadeEventosQuery.isError ? 'Erro ao carregar a agenda.' : null}
                            legend={disponibilidadeSalaId ? LEGENDA_SALA : LEGENDA_TODAS}
                        />
                    </div>
</Modal>

                <ProfessorAvailabilityModal
                    professorId={selectedProfessorId}
                    professorNome={selectedProfessorNome}
                    open={professorAvailabilityOpen}
                    onClose={() => {
                        setProfessorAvailabilityOpen(false);
                        setSelectedProfessorId(null);
                        setSelectedProfessorNome(null);
                    }}
                />

            </main>

        </PermissionGate>

    );

}



function opcaoFilterGuard(_id: number): number {

    return _id;

}


