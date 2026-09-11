import {useCallback, useEffect, useMemo, useRef, useState} from 'react';



import {X, Calendar, Grid} from 'lucide-react';

import {useNavigate, useSearchParams} from 'react-router-dom';

import {PermissionGate} from '../../../shared/services/permissions';

import {AutoComplete, type AutoCompleteOption} from '../../../shared/components/AutoComplete';

import {api, useApi} from '../../../shared/services/api';

import {legacyClassName} from '../../../shared/components/DataTable';

import {format} from 'date-fns';

import {Modal} from '../../../shared/components/Modal';

import {ScheduleWeekView, mondayOf, toIsoDate, monthRangeForWeek, type ScheduleEventData} from '../../../shared/components/WeeklyGrid';



interface OcorrenciaLocal {

    key: string;

    id?: number;

    data: string;

    diaAulaId?: number;

    salaId?: number;

    aulaCoringa?: boolean;

    aulaPresencial?: boolean;

    ativo?: boolean;

}



interface InvalidaData {

    data: string;

    motivo: string;

}



interface DiaAulaConfig {

    id?: number;

    diaSemanaId: number;

    turnoEducacaoId: number;

    tempoAulaId: number;

}



interface OferecimentoCCData {

    entity: {

        id?: number;

        unidadeId?: number;

        periodoId?: number;

        curriculoId?: number;

        componenteCurricularId?: number;

        grupoId?: number;

        salaId?: number;

        vagas?: number;

        dataInicio?: string;

        dataFim?: string;

        dataCancelamento?: string | null;

        tipoReplicacao?: number;

        tipoPlanejamento?: string;

        diasReplicar?: number;

        qtdeSequencia?: number;

        qtdeEspacoCaderno?: number;

        registraFrequencia?: boolean;

        possuiAvaliacao?: boolean;

        replicar?: boolean;

        replicado?: boolean;

        detalharReplicacao?: boolean;

        componenteCurricularReplicarId?: number;

        status?: number;

        sequencia?: number;

        inscritos?: number;

    };

    novoGrupo: boolean;

    novoGrupoNome: string;

    diasAulaConfig: DiaAulaConfig[];

    diasAulaSelecionados: number[];

    ocorrencias: OcorrenciaLocal[];

    invalidas: InvalidaData[];

    professorId?: number | null;

}



const DIAS_NOMES = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];



const TIPOS_REPLICACAO = [

    {valor: 0, rotulo: 'Na data início'},

    {valor: 1, rotulo: 'Após data início'},

    {valor: 2, rotulo: 'Na data fim'},

    {valor: 3, rotulo: 'Após data fim'},
];


const LEGENDA_OFERECIMENTO = [
    {className: 'evento-yellow', label: 'Em andamento'},
    {className: 'evento-green', label: 'Liberada'},
    {className: 'evento-orange', label: 'Pendente'},
    {className: 'evento-red', label: 'Lotada'},
    {className: 'evento-black', label: 'Concluída'},
    {className: 'evento-purple', label: 'Finalizada'},
    {className: 'evento-blue', label: 'Feriado'},
];


function fmtDate(d: Date): string {

    const y = d.getFullYear();

    const m = String(d.getMonth() + 1).padStart(2, '0');

    const dia = String(d.getDate()).padStart(2, '0');

    return `${y}-${m}-${dia}`;

}



function parseISO(valor: any): Date | null {

    if (!valor) return null;

    const d = new Date(valor);

    return isNaN(d.getTime()) ? null : d;

}



function numeroDiaSemana(nome: any, id: any): number {

    const texto = String(nome ?? '').toLowerCase();

    if (texto.startsWith('dom')) return 1;

    if (texto.startsWith('seg')) return 2;

    if (texto.startsWith('ter')) return 3;

    if (texto.startsWith('qua')) return 4;

    if (texto.startsWith('qui')) return 5;

    if (texto.startsWith('sex')) return 6;

    if (texto.startsWith('sáb') || texto.startsWith('sab')) return 7;

    return ((Number(id) || 1) - 1) % 7 + 1;

}



type TabKey = 'tabComponente' | 'tabDiaAula' | 'tabProfessor';



const TABS: {key: TabKey; label: string}[] = [

    {key: 'tabComponente', label: 'Componente Curricular'},

    {key: 'tabDiaAula', label: 'Dias Aula'},

    {key: 'tabProfessor', label: 'Professor'},

];



export default function ViewOferecimentoComponenteCurricularFormOferecimentoComponenteCurricularListScreen() {

    const [searchParams] = useSearchParams();

    const navigate = useNavigate();

    const idEdicao = searchParams.get('id');



const [carregando, setCarregando] = useState(true);

    const [unidades, setUnidades] = useState<any[]>([]);

    const [curriculos, setCurriculos] = useState<any[]>([]);

    const [cursosDaUnidadeIds, setCursosDaUnidadeIds] = useState<number[]>([]);

    const [componentes, setComponentes] = useState<any[]>([]);

    const [matrizIds, setMatrizIds] = useState<number[]>([]);

    const [grupos, setGrupos] = useState<any[]>([]);

    const [salas, setSalas] = useState<any[]>([]);

    const [diaAulas, setDiaAulas] = useState<any[]>([]);

    const [diasSemana, setDiasSemana] = useState<any[]>([]);

    const [professores, setProfessores] = useState<any[]>([]);

    const [turnos, setTurnos] = useState<any[]>([]);

    const [tempoAulas, setTempoAulas] = useState<any[]>([]);

    const [professoresTurmaIds, setProfessoresTurmaIds] = useState<number[] | null>(null);

    const [gerando, setGerando] = useState(false);

    const [activeTab, setActiveTab] = useState<TabKey>('tabComponente');

    const [criterio, setCriterio] = useState<any>(null);


    const [modalOfertaOpen, setModalOfertaOpen] = useState(false);
    const [modalSalaOpen, setModalSalaOpen] = useState(false);
    const [modalOfertaWeekStart, setModalOfertaWeekStart] = useState(() => toIsoDate(mondayOf(new Date())));
    const [modalSalaWeekStart, setModalSalaWeekStart] = useState(() => toIsoDate(mondayOf(new Date())));
    const [modalOfertaEvents, setModalOfertaEvents] = useState<ScheduleEventData[]>([]);
    const [modalSalaEvents, setModalSalaEvents] = useState<ScheduleEventData[]>([]);
    const [modalOfertaLoading, setModalOfertaLoading] = useState(false);
    const [modalSalaLoading, setModalSalaLoading] = useState(false);


    // Master-detail state for diaSemana entries

    const [diaSemanaSelecionado, setDiaSemanaSelecionado] = useState<any>({

        diaSemanaId: undefined,

        turnoEducacaoId: undefined,

        tempoAulaId: undefined,

    });

    const [diasSemanaConfigurados, setDiasSemanaConfigurados] = useState<Array<{

        key: string;

        diaSemanaId: number;

        turnoEducacaoId: number;

        tempoAulaId: number;

    }>>([]);

    const [existingDiasAula, setExistingDiasAula] = useState<Array<{
        id: number;
        diaSemanaId: number;
        turnoEducacaoId: number;
        tempoAulaId: number;
        turnoEducacao_descricao?: string;
        tempoAula_descricao?: string;
    }>>([]);



    const [data, setData] = useState<OferecimentoCCData>({

        entity: {},

        novoGrupo: true,

        novoGrupoNome: '',

        diasAulaConfig: [],

        diasAulaSelecionados: [],

        ocorrencias: [],

        invalidas: [],

        professorId: null,

    });



    const dataRef = useRef(data);

    useEffect(() => { dataRef.current = data; }, [data]);



    const ofcApi = useApi<any>('/api/educacao/oferecimento-componente-curricular');



    useEffect(() => {

        (async () => {

            try {

                const [uns, curs, comps, grps, sls, das, tnos, tpas] = await Promise.all([

                    api.get('/api/basico/unidade'),

                    api.get('/api/educacao/curriculo'),

                    api.get('/api/educacao/componente-curricular'),

                    api.get('/api/educacao/grupo'),

                    api.get('/api/educacao/sala'),

                    api.get('/api/educacao/dia-aula'),

                    api.get('/api/educacao/turno-educacao'),

                    api.get('/api/educacao/tempo-aula'),

                ]);

                setUnidades(uns?.data ?? []);

                setCurriculos(curs?.data ?? []);

                setComponentes(comps?.data ?? []);

                setGrupos(grps?.data ?? []);

                setSalas(sls?.data ?? []);

                setDiaAulas(das?.data ?? []);

                setTurnos(tnos?.data ?? []);

                setTempoAulas(tpas?.data ?? []);

                try {

                    const res = await api.get('/api/view/diaSemana/listDiaSemana');

                    setDiasSemana(res?.data || []);

                } catch { setDiasSemana([]); }

                try {

                    const res = await api.get('/api/professor/professor');

                    setProfessores(res?.data || []);

                } catch (err) { console.warn('Erro ao buscar professores:', err); setProfessores([]); }



                if (idEdicao) {

                    try {

                        const ent = (await api.get(`/api/educacao/oferecimento-componente-curricular/${idEdicao}`))?.data;

                        const todas = (await api.get('/api/educacao/ocorrencia-componente-curricular'))?.data;

                        const minhas: any[] = (todas ?? []).filter((o: any) => o.oferecimentoComponenteCurricularId === Number(idEdicao));

                        const ocorrencias: OcorrenciaLocal[] = minhas.map((o) => ({

                            key: `db-${o.id}`, id: o.id,

                            data: fmtDate(parseISO(o.data) ?? new Date()),

                            diaAulaId: o.diaAulaId, salaId: o.salaId,

                            aulaCoringa: !!o.aulaCoringa, aulaPresencial: o.aulaPresencial !== false, ativo: o.ativo !== false,

                        }));

                        // Fonte de verdade: join table edc_oferecimento_dias_aula via API existente.
                        // (antes usava o state `diaAulas` ainda vazio aqui + só ocorrências como fallback,
                        //  por isso a aba "Dias Aula" vinha vazia na edição).
                        const diasAulaDoBanco: Array<{
                            id: number;
                            diaSemanaId: number;
                            turnoEducacaoId: number;
                            tempoAulaId: number;
                            turnoEducacao_descricao?: string;
                            tempoAula_descricao?: string;
                        }> = await (async () => {
                            try {
                                const resp = await api.get<Array<{
                                    id: number;
                                    diaSemanaId: number;
                                    turnoEducacaoId: number;
                                    tempoAulaId: number;
                                    turnoEducacao_descricao?: string;
                                    tempoAula_descricao?: string;
                                }>>('/api/educacao/oferecimento-componente-curricular/buscar-dias-aula-por-oferecimento', {
                                    params: {oferecimentoComponenteCurricularId: ent?.id ?? Number(idEdicao)}
                                });
                                return resp?.data ?? [];
                            } catch (e) {
                                console.warn('Erro ao carregar dias de aula do oferecimento (edc_oferecimento_dias_aula):', e);
                                return [];
                            }
                        })();
                        setExistingDiasAula(diasAulaDoBanco);

                        const catalogoDiaAulas: any[] = das?.data ?? [];
                        let diasAulaConfig: DiaAulaConfig[];
                        let diaAulaIdsUnicos: number[];
                        if (diasAulaDoBanco.length) {
                            diasAulaConfig = diasAulaDoBanco.map((da) => ({id: da.id, diaSemanaId: da.diaSemanaId, turnoEducacaoId: da.turnoEducacaoId, tempoAulaId: da.tempoAulaId}));
                            diaAulaIdsUnicos = diasAulaDoBanco.map((da) => da.id);
                        } else {
                            // Fallback: reconstrói a partir das ocorrências quando o join ainda está vazio.
                            diaAulaIdsUnicos = [...new Set(minhas.map((o) => o.diaAulaId).filter(Boolean))] as number[];
                            diasAulaConfig = catalogoDiaAulas
                                .filter((da) => diaAulaIdsUnicos.includes(da.id))
                                .map((da) => ({id: da.id, diaSemanaId: da.diaSemanaId, turnoEducacaoId: da.turnoEducacaoId, tempoAulaId: da.tempoAulaId}));
                        }

                        const diasSemanaConfigLoaded = diasAulaConfig.map((c, idx) => ({key: `loaded-${idx}`, ...c}));

                        updateFields({

                            entity: {...ent, dataCancelamento: ent?.dataCancelamento ? fmtDate(parseISO(ent.dataCancelamento)!) : null},

                            novoGrupo: false, novoGrupoNome: '',

                            diasAulaConfig,

                            diasAulaSelecionados: diaAulaIdsUnicos,

                            ocorrencias, invalidas: [],

                            professorId: ent.professorId ?? minhas.find((o) => o.professorId)?.professorId ?? null,

                        });

                        setDiasSemanaConfigurados(diasSemanaConfigLoaded);

                        if (ent.unidadeId) {

                            try { setCursosDaUnidadeIds((await api.get('/api/educacao/curriculo/buscar-cursos-da-unidade', {params: {unidadeId: ent.unidadeId}}))?.data ?? []); } catch { setCursosDaUnidadeIds([]); }

                        }

                        if (ent.curriculoId) {

                            try { setMatrizIds((await api.get('/api/educacao/oferecimento-componente-curricular/buscar-matriz-curricular', {params: {curriculoId: ent.curriculoId}}))?.data ?? []); } catch { setMatrizIds([]); }

                        }

                    } catch { alert('Não foi possível carregar o oferecimento para edição'); }

                }

            } finally { setCarregando(false); }

        })();

    }, []);



    const updateField = useCallback(<K extends keyof OferecimentoCCData>(key: K, value: OferecimentoCCData[K]) => {

        setData(prev => ({...prev, [key]: value}));

    }, []);



    const updateFields = useCallback((fields: Partial<OferecimentoCCData>) => {

        setData(prev => ({...prev, ...fields}));

    }, []);



    const cursosDisponiveis = useMemo(() => {

        if (!data.entity.unidadeId) return [];

        if (!cursosDaUnidadeIds.length && !idEdicao) return curriculos;

        return curriculos.filter((c) => cursosDaUnidadeIds.includes(c.id));

    }, [curriculos, cursosDaUnidadeIds, data.entity.unidadeId]);



    const componentesDoCurso = useMemo(() => {

        if (!data.entity.curriculoId) return [];

        if (!matrizIds.length && !idEdicao) return componentes;

        return componentes.filter((c) => matrizIds.includes(c.id));

    }, [componentes, matrizIds, data.entity.curriculoId]);



    const gruposDisponiveis = useMemo(() => grupos.filter((g) => g.unidadeId === data.entity.unidadeId && g.curriculoId === data.entity.curriculoId), [grupos, data.entity.unidadeId, data.entity.curriculoId]);



    const salasDaUnidade = useMemo(() => salas.filter((s) => s.unidadeId === data.entity.unidadeId), [salas, data.entity.unidadeId]);



    const nomeDiaSemana = (diaSemanaId?: number): string => diasSemana.find((d) => d.id === diaSemanaId)?.nome ?? DIAS_NOMES[(((diaSemanaId ?? 1) - 1) % 7)];



    const rotuloDiaAula = (da: any): string => [nomeDiaSemana(da.diaSemanaId), da.turnoEducacao_descricao, da.tempoAula_descricao].filter(Boolean).join(' → ');



    const calcularVagas = (salaId?: number, curriculoId?: number): number | undefined => {

        const sala = salas.find((s) => s.id === salaId);

        const curriculo = curriculos.find((c) => c.id === curriculoId);

        if (!sala) return undefined;

        const qtdMaximaAlunos = curriculo?.qtdMaximaAlunos ?? 0;

        const quantidadeSala = sala.quantidadeAlunos ?? 0;

        if (!qtdMaximaAlunos || quantidadeSala < qtdMaximaAlunos) return quantidadeSala;

        return qtdMaximaAlunos;

    };



    const aoSelecionarUnidade = async (valor: number) => {

        updateFields({entity: {...dataRef.current.entity, unidadeId: valor, curriculoId: undefined, componenteCurricularId: undefined}});

        try { setCursosDaUnidadeIds((await api.get('/api/educacao/curriculo/buscar-cursos-da-unidade', {params: {unidadeId: valor}}))?.data ?? []); } catch { setCursosDaUnidadeIds([]); }

    };



    const aoSelecionarCurso = async (valor: number) => {

        updateFields({entity: {...dataRef.current.entity, curriculoId: valor, componenteCurricularId: undefined}});

        try { setMatrizIds((await api.get('/api/educacao/oferecimento-componente-curricular/buscar-matriz-curricular', {params: {curriculoId: valor}}))?.data ?? []); } catch { setMatrizIds([]); }

        if (valor && data.entity.unidadeId) {

            try {

                const ids = (await api.get(`/api/educacao/criterio/buscar-criterio`, {params: {curriculoId: valor, unidadeId: data.entity.unidadeId}}))?.data;

                if (Array.isArray(ids) && ids.length) {

                    const {data: criterio} = await api.get(`/api/educacao/criterio/${ids[0]}`);

                    setCriterio(criterio);

                } else {

                    setCriterio(null);

                }

            } catch { setCriterio(null); }

        }

    };



    const aoSelecionarSala = (valor: number) => {

        const atual = dataRef.current;

        updateFields({entity: {...atual.entity, salaId: valor, vagas: calcularVagas(valor, atual.entity.curriculoId)}});

    };



    const ajustarVagas = () => {

        const atual = dataRef.current;

        updateFields({entity: {...atual.entity, vagas: calcularVagas(atual.entity.salaId, atual.entity.curriculoId)}});

    };



    const alternarDiaAulaConfig = (config: DiaAulaConfig) => {

        const atuais = dataRef.current.diasAulaConfig;

        const existe = atuais.find((c) => c.diaSemanaId === config.diaSemanaId && c.turnoEducacaoId === config.turnoEducacaoId && c.tempoAulaId === config.tempoAulaId);

        if (existe) {

            updateField('diasAulaConfig', atuais.filter((c) => c !== existe));

        } else {

            updateField('diasAulaConfig', [...atuais, config]);

        }

    };



    const removerDiaAulaConfig = (config: DiaAulaConfig) => {

        const atuais = dataRef.current.diasAulaConfig;

        updateField('diasAulaConfig', atuais.filter((c) => c !== config));

    };



    const alternarDiaAula = (id: number) => {

        const atuais = dataRef.current.diasAulaSelecionados ?? [];

        const existe = atuais.includes(id);

        const novos = existe ? atuais.filter((x) => x !== id) : [...atuais, id];

        // manter diasAulaConfig sincronizado para gerarAulas

        const da = diaAulas.find((x: any) => x.id === id);

        let novosConfigs = dataRef.current.diasAulaConfig;

        if (da) {

            const diaSemanaId = da.diaSemanaId ?? da.diaSemana?.id;

            const turnoEducacaoId = da.turnoEducacaoId ?? da.turnoEducacao?.id;

            const tempoAulaId = da.tempoAulaId ?? da.tempoAula?.id;

            if (diaSemanaId && turnoEducacaoId && tempoAulaId) {

                const config: DiaAulaConfig = {diaSemanaId, turnoEducacaoId, tempoAulaId};

                const configs = dataRef.current.diasAulaConfig;

                const existeConfig = configs.find((c) => c.diaSemanaId === config.diaSemanaId && c.turnoEducacaoId === config.turnoEducacaoId && c.tempoAulaId === config.tempoAulaId);

                if (existe && existeConfig) {

                    novosConfigs = configs.filter((c) => c !== existeConfig);

                } else if (!existe && !existeConfig) {

                    novosConfigs = [...configs, config];

                }

            }

        }

        if (novosConfigs !== dataRef.current.diasAulaConfig) {

            updateFields({diasAulaSelecionados: novos, diasAulaConfig: novosConfigs});

        } else {

            updateField('diasAulaSelecionados', novos);

        }

    };



    const getDiaAulaIdsSelecionados = (): number[] => {

        const configs = dataRef.current.diasAulaConfig;

        return diaAulas

            .filter((da) => configs.some((c) => c.diaSemanaId === da.diaSemanaId && c.turnoEducacaoId === da.turnoEducacaoId && c.tempoAulaId === da.tempoAulaId))

            .map((da) => da.id);

    };



    const removerOcorrencia = async (occ: OcorrenciaLocal) => {

        if (occ.id) { try { await api.delete(`/api/educacao/ocorrencia-componente-curricular/${occ.id}`); } catch { alert('Não foi possível remover a aula salva'); return; } }

        updateField('ocorrencias', dataRef.current.ocorrencias.filter((o) => o.key !== occ.key));

    };



    const fetchProfessor = async (query: string, diaSemanaId?: number, turnoId?: number, tempoAulaId?: number): Promise<AutoCompleteOption[]> => {

        if (query.length < 3) return [];

        const params: Record<string, string | number> = {query};

        if (diaSemanaId) params.diaSemanaId = diaSemanaId;

        if (turnoId) params.turnoId = turnoId;

        if (tempoAulaId) params.tempoAulaId = tempoAulaId;

        try {

            const {data: rows} = await api.get<Array<{id: number; nome: string}>>('/api/professor/professor/auto-complete-professor', {params});

            return (rows ?? []).map((p) => ({id: Number(p.id), label: p.nome || `#${p.id}`}));

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



    const gerarAulas = async () => {

        const atual = dataRef.current;

        const e = atual.entity;

        if (!e.unidadeId || !e.curriculoId || !e.salaId) { alert('Selecione unidade, curso e sala antes de gerar as aulas'); return; }

        if (!atual.diasAulaConfig.length) { alert('Adicione pelo menos uma configuração de dia de aula (dia semana, turno e tempo)'); return; }

        if (!e.dataInicio || !e.dataFim) { alert('Defina as datas de início e fim do oferecimento'); return; }

        if (e.dataInicio > e.dataFim) { alert('A data inicial deve ser anterior ou igual à data final'); return; }



        const diaAulaIdsSelecionados = getDiaAulaIdsSelecionados();

        if (!diaAulaIdsSelecionados.length) { alert('Nenhum dia de aula válido encontrado para as configurações selecionadas'); return; }



        setGerando(true);

        try {

            const feriadoMap = new Map<string, string>();

            try {

                const ids = (await api.get('/api/basico/feriado/buscar-feriado-da-unidade-list', {params: {unidade: e.unidadeId, inicio: e.dataInicio, fim: e.dataFim}}))?.data;

                if (Array.isArray(ids) && ids.length) {

                    const todos = (await api.get('/api/basico/feriado'))?.data;

                    for (const f of todos ?? []) { if (ids.includes(f.id)) { const dFer = parseISO(f.dataFeriado); if (dFer) feriadoMap.set(fmtDate(dFer), f.nome ?? 'Feriado'); } }

                }

            } catch { feriadoMap.clear(); }



            const critInicio = parseISO(criterio?.dataInicio);

            const critFim = parseISO(criterio?.dataFim);



            const existentes = [...atual.ocorrencias];

            const novas: OcorrenciaLocal[] = [];

            const invalidas: InvalidaData[] = [];



            const cursor = new Date(`${e.dataInicio}T00:00:00`);

            while (fmtDate(cursor) <= e.dataFim!) {

                const iso = fmtDate(cursor);

                const diaSemanaData = cursor.getDay() + 1;

                for (const da of diaAulas) {

                    if (!diaAulaIdsSelecionados.includes(da.id)) continue;

                    if (numeroDiaSemana(nomeDiaSemana(da.diaSemanaId), da.diaSemanaId) !== diaSemanaData) continue;

                    const feriado = feriadoMap.get(iso);

                    if (feriado) { invalidas.push({data: iso, motivo: feriado}); continue; }

                    if (critInicio && iso < fmtDate(critInicio)) { invalidas.push({data: iso, motivo: 'Existe um critério definido para o inicio das aulas'}); continue; }

                    if (critFim && iso > fmtDate(critFim)) { invalidas.push({data: iso, motivo: 'Existe um critério definido para o fim das aulas'}); continue; }

                    if (existentes.some((o) => o.data === iso && o.salaId === e.salaId && o.diaAulaId === da.id)) { invalidas.push({data: iso, motivo: `Aula marcada na turma ${salas.find((s) => s.id === e.salaId)?.descricao ?? e.salaId}`}); continue; }

                    const nova: OcorrenciaLocal = {key: `${iso}-${da.id}`, data: iso, diaAulaId: da.id, salaId: e.salaId, aulaCoringa: false, aulaPresencial: true, ativo: true};

                    existentes.push(nova); novas.push(nova);

                }

                cursor.setDate(cursor.getDate() + 1);

            }

            updateFields({ocorrencias: existentes, invalidas});

            alert(`Aulas geradas: ${novas.length}. Datas ignoradas: ${invalidas.length}`);

        } finally { setGerando(false); }

    };



    const validateTab = (targetTab: TabKey): boolean => {

        const d = dataRef.current;

        if (targetTab === 'tabDiaAula') {

            if (!d.entity.unidadeId) { alert('Selecione a unidade'); return false; }

            if (!d.entity.curriculoId) { alert('Selecione o curso'); return false; }

            if (!d.entity.componenteCurricularId) { alert('Selecione o componente curricular'); return false; }

            if (d.novoGrupo && !d.novoGrupoNome.trim()) { alert('Informe o nome do grupo'); return false; }

            if (!d.novoGrupo && !d.entity.grupoId) { alert('Selecione o grupo'); return false; }

        }

        if (targetTab === 'tabProfessor') {

            if (!d.diasAulaConfig.length) { alert('Adicione pelo menos uma configuração de dia de aula (dia semana, turno e tempo)'); return false; }

            if (!d.entity.vagas || d.entity.vagas <= 0) { alert('O número de vagas deve ser maior que zero'); return false; }

            if (!d.ocorrencias.length) { alert('Defina os dias de aula antes de escolher o professor'); return false; }

        }

        return true;

    };



    const handleTabChange = (newTab: TabKey) => {

        const tabOrder: TabKey[] = ['tabComponente', 'tabDiaAula', 'tabProfessor'];

        const currentIndex = tabOrder.indexOf(activeTab);

        const newIndex = tabOrder.indexOf(newTab);

        if (newIndex > currentIndex) {

            for (let i = currentIndex + 1; i <= newIndex; i++) { if (!validateTab(tabOrder[i])) return; }

        }

        setActiveTab(newTab);

    };



    const prepararProfessores = async () => {

        const d = dataRef.current;

        if (!d.entity.vagas || d.entity.vagas <= 0) { alert('O número de vagas não pode ser zero'); return; }

        if (!d.ocorrencias.length) { alert('Defina os dias de aula antes de escolher o professor'); return; }

        try {

            const ids = (await api.get('/api/professor/professor/buscar-lista-professores-para-turma', {params: {componenteCurricularId: d.entity.componenteCurricularId, unidadeId: d.entity.unidadeId}}))?.data;

            const lista = Array.isArray(ids) ? ids : [];

            setProfessoresTurmaIds(lista.length ? lista : null);

            if (!d.professorId && lista.length) { updateField('professorId', lista[0]); }
} catch { setProfessoresTurmaIds(null); }

    };



    const modalOfertaRangeRef = useRef<{inicio: string; fim: string} | null>(null);
    const modalSalaRangeRef = useRef<{inicio: string; fim: string} | null>(null);

    const fetchModalOferta = useCallback(async (semana: string, d: OferecimentoCCData) => {
        const {inicio, fim} = monthRangeForWeek(semana);
        setModalOfertaLoading(true);
        try {
            const resp = await api.get('/api/educacao/disponibilidade-oferecimento-curso/schedule-events', {
                params: {unidadeId: d.entity.unidadeId, inicio, fim}
            });
            setModalOfertaEvents(resp.data ?? []);
            modalOfertaRangeRef.current = {inicio, fim};
        } catch (e) {
            console.error(e);
            setModalOfertaEvents([]);
        } finally {
            setModalOfertaLoading(false);
        }
    }, []);

    const abrirModalOferta = async () => {
        const d = dataRef.current;
        if (!d.entity.unidadeId) { alert('Selecione a unidade primeiro'); return; }
        setModalOfertaOpen(true);
        await fetchModalOferta(modalOfertaWeekStart, d);
    };

    const mudarSemanaModalOferta = useCallback((novaSemana: string) => {
        setModalOfertaWeekStart(novaSemana);
        const {inicio, fim} = monthRangeForWeek(novaSemana);
        if (!modalOfertaRangeRef.current || modalOfertaRangeRef.current.inicio !== inicio || modalOfertaRangeRef.current.fim !== fim) {
            const d = dataRef.current;
            if (!d.entity.unidadeId) return;
            void fetchModalOferta(novaSemana, d);
        }
    }, [fetchModalOferta]);

    const fetchModalSala = useCallback(async (semana: string, d: OferecimentoCCData) => {
        const {inicio, fim} = monthRangeForWeek(semana);
        setModalSalaLoading(true);
        try {
            const resp = await api.get('/api/educacao/disponibilidade-sala/schedule-events', {
                params: {unidadeId: d.entity.unidadeId, salaId: d.entity.salaId, inicio, fim}
            });
            setModalSalaEvents(resp.data ?? []);
            modalSalaRangeRef.current = {inicio, fim};
        } catch (e) {
            console.error(e);
            setModalSalaEvents([]);
        } finally {
            setModalSalaLoading(false);
        }
    }, []);

    const abrirModalSala = async () => {
        const d = dataRef.current;
        if (!d.entity.unidadeId) { alert('Selecione a unidade primeiro'); return; }
        if (!d.entity.salaId) { alert('Selecione a sala primeiro'); return; }
        setModalSalaOpen(true);
        await fetchModalSala(modalSalaWeekStart, d);
    };

    const mudarSemanaModalSala = useCallback((novaSemana: string) => {
        setModalSalaWeekStart(novaSemana);
        const {inicio, fim} = monthRangeForWeek(novaSemana);
        if (!modalSalaRangeRef.current || modalSalaRangeRef.current.inicio !== inicio || modalSalaRangeRef.current.fim !== fim) {
            const d = dataRef.current;
            if (!d.entity.unidadeId || !d.entity.salaId) return;
            void fetchModalSala(novaSemana, d);
        }
    }, [fetchModalSala]);



    const salvar = async () => {

        const d = dataRef.current; const e = d.entity;

        if (!validateTab('tabDiaAula') || !validateTab('tabProfessor')) return;

        if (!d.professorId) { alert('Selecione o responsável pela turma'); return; }

        try {

            let grupoId = e.grupoId;

            if (d.novoGrupo) {

                const nome = d.novoGrupoNome.trim();

                const existente = gruposDisponiveis.find((g) => (g.nome ?? '').toLowerCase() === nome.toLowerCase());

                grupoId = existente ? existente.id : (await api.post('/api/educacao/grupo', {nome, unidadeId: e.unidadeId, curriculoId: e.curriculoId}))?.id;

                if (!grupoId) { alert('Não foi possível criar o grupo'); return; }

            }

            const datas = d.ocorrencias.map((o) => o.data).sort();

            const payload = {unidadeId: e.unidadeId, grupoId, salaId: e.salaId, curriculoId: e.curriculoId, componenteCurricularId: e.componenteCurricularId, professorId: d.professorId, vagas: e.vagas, inscritos: 0, dataInicio: datas[0], dataFim: datas[datas.length - 1], dataAlteracao: new Date().toISOString(), tipoReplicacao: e.replicar ? (e.tipoReplicacao ?? 0) : 0, diasReplicar: e.replicar ? e.diasReplicar : null, qtdeSequencia: e.qtdeSequencia ?? 1, registraFrequencia: e.registraFrequencia !== false, possuiAvaliacao: e.possuiAvaliacao !== false, replicar: !!e.replicar, replicado: false, detalharReplicacao: !!e.detalharReplicacao, componenteCurricularReplicarId: e.detalharReplicacao ? e.componenteCurricularReplicarId : null, status: e.status ?? 0, sequencia: e.sequencia ?? 0};

            const salvo = e.id ? await ofcApi.put(e.id, payload) : await ofcApi.post(payload);

            const oferecimentoId = salvo?.id ?? e.id;

            for (const occ of d.ocorrencias.filter((o) => !o.id)) {

                await api.post('/api/educacao/ocorrencia-componente-curricular', {professorId: d.professorId, salaId: occ.salaId ?? e.salaId, ativo: true, oferecimentoComponenteCurricularId: oferecimentoId, data: occ.data, diaAulaId: occ.diaAulaId, aulaCoringa: false, aulaPresencial: true});

            }

            alert('Oferecimento salvo com sucesso!');

            navigate('/view/oferecimentoComponenteCurricular/listOferecimentoComponenteCurricular');

        } catch (error) { console.error('Erro ao salvar:', error); alert('Erro ao salvar oferecimento'); }

    };



    if (carregando) return (<PermissionGate permission="READ"><main><h1>Oferecimento Componente Curricular</h1><div className="div_form"><p className="master-detail-empty">Carregando...</p></div></main></PermissionGate>);



    const saveLabel = gerando ? 'Salvando...' : activeTab === 'tabProfessor' ? 'Salvar' : 'Próximo';



    const voltarAbaOuLista = () => {

        const tabOrder: TabKey[] = ['tabComponente', 'tabDiaAula', 'tabProfessor'];

        const currentIndex = tabOrder.indexOf(activeTab);

        if (currentIndex > 0) setActiveTab(tabOrder[currentIndex - 1]);

        else navigate('/view/oferecimentoComponenteCurricular/listOferecimentoComponenteCurricular');

    };



    const proximaAbaOuSalvar = () => {

        const tabOrder: TabKey[] = ['tabComponente', 'tabDiaAula', 'tabProfessor'];

        const currentIndex = tabOrder.indexOf(activeTab);

        if (currentIndex < tabOrder.length - 1) handleTabChange(tabOrder[currentIndex + 1]);

        else void salvar();

    };



    return (

        <PermissionGate permission="READ">

            <main>

                <h1>Oferecimento Componente Curricular</h1>

<div style={{width: '100%'}}>

                        <div className="div_form">

                            <div className="form-title">Oferecimento Componente Curricular</div>

                            <div className="ofc-tabs">

                                <nav className="ofc-tabs-nav" role="tablist">

                                    {TABS.map((tab) => (

                                        <button key={tab.key} type="button" role="tab" aria-selected={activeTab === tab.key} aria-controls={`panel-${tab.key}`} id={`tab-${tab.key}`}

                                            className={`ofc-tab ${activeTab === tab.key ? 'ofc-tab-active' : ''} ${tab.key !== activeTab && TABS.findIndex(t => t.key === activeTab) > TABS.findIndex(t => t.key === tab.key) ? 'ofc-tab-disabled' : ''}`}

                                            onClick={() => handleTabChange(tab.key)} disabled={gerando}>

                                            {tab.label}

                                        </button>

                                    ))}

                                </nav>

                                <div className="ofc-tabs-panels">

                                    <div role="tabpanel" id="panel-tabComponente" aria-labelledby="tab-tabComponente" hidden={activeTab !== 'tabComponente'}>

                                        <section className="tab-content">

                                            <fieldset className="form-fieldset" style={{marginBottom: 16}}>

                                                <legend>Grupo</legend>

                                                <div className="form-grid">

                                                    <div className="form-field">

                                                        <span className="form-label">Criar nova sequência</span>

                                                        <label style={{display: 'flex', gap: 6, alignItems: 'center'}}>

                                                            <input type="checkbox" checked={data.novoGrupo} onChange={(ev) => updateField('novoGrupo', ev.target.checked)}/> Sim

                                                        </label>

                                                    </div>

                                                    {data.novoGrupo ? (

                                                        <label className="form-field"><span className="form-label">Grupo *</span><input type="text" className="form-input" value={data.novoGrupoNome} onChange={(ev) => updateField('novoGrupoNome', ev.target.value)}/></label>

                                                    ) : (

                                                        <label className="form-field"><span className="form-label">Grupo *</span><select className="form-input form-select" value={data.entity.grupoId ?? ''} onChange={(ev) => updateField('entity.grupoId', Number(ev.target.value))}><option value="">Selecione</option>{gruposDisponiveis.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}</select></label>

                                                    )}

                                                    <button type="button" className="btn-action btnyellow" style={{gridColumn: 'span 2'}} onClick={abrirModalOferta}>

                                                        Consulte os Oferecimentos

                                                    </button>

                                                </div>

                                            </fieldset>

                                            <fieldset className="form-fieldset" style={{marginBottom: 16}}>

                                                <legend>Geral</legend>

                                                <div className="form-grid">

                                                    <label className="form-field"><span className="form-label">ID</span><input type="text" className="form-input" value={data.entity.id ?? ''} disabled/></label>

                                                    <label className="form-field"><span className="form-label">Unidade *</span><select className="form-input form-select" value={data.entity.unidadeId ?? ''} onChange={(ev) => aoSelecionarUnidade(Number(ev.target.value))}><option value="">Selecione</option>{unidades.map((u) => <option key={u.id} value={u.id}>{u.nomeFantasia || u.razaoSocial || u.sucinto || `Unidade ${u.id}`}</option>)}</select></label>

                                                    <label className="form-field"><span className="form-label">Curso *</span><select className="form-input form-select" value={data.entity.curriculoId ?? ''} onChange={(ev) => aoSelecionarCurso(Number(ev.target.value))}><option value="">Selecione</option>{cursosDisponiveis.map((c) => <option key={c.id} value={c.id}>{c.descricao || c.sigla || `Curso ${c.id}`}</option>)}</select></label>

                                                    <label className="form-field"><span className="form-label">Componente Curricular *</span><select className="form-input form-select" value={data.entity.componenteCurricularId ?? ''} onChange={(ev) => updateField('entity.componenteCurricularId', Number(ev.target.value))}><option value="">Selecione</option>{componentesDoCurso.map((c) => <option key={c.id} value={c.id}>{c.descricao || c.sucinto || `Componente ${c.id}`}</option>)}</select></label>

                                                    <label className="form-field"><span className="form-label">Data Cancelamento</span><input type="date" className="form-input" value={data.entity.dataCancelamento ?? ''} disabled/></label>

                                                </div>

                                            </fieldset>

                                            {criterio && (

                                                <div className="form-field" style={{marginTop: 16, padding: 12, background: '#f8f9fa', borderRadius: 8}}>

                                                    <strong>Critério do Curso:</strong><br/>

                                                    Turmas máximas: {criterio.qtdTurmaAbertas ?? 'Não definido'} | Período: {criterio.periodo ?? 'Não definido'}<br/>

                                                    {criterio.dataInicio && `Início válido a partir de: ${fmtDate(parseISO(criterio.dataInicio)!)}`} | {criterio.dataFim && `Término até: ${fmtDate(parseISO(criterio.dataFim)!)}`}

                                                </div>

                                            )}

                                            <fieldset className="form-fieldset" style={{marginBottom: 16}}>

                                                <legend>Replicar</legend>

                                                <div className="form-grid">

                                                    <div className="form-field"><span className="form-label">Replicar</span><div style={{display: 'flex', gap: 14, alignItems: 'center'}}>

                                                        <label style={{display: 'flex', gap: 4, alignItems: 'center'}}><input type="radio" name="replicar" checked={!!data.entity.replicar} onChange={() => updateField('entity.replicar', true)}/> Sim</label>

                                                        <label style={{display: 'flex', gap: 4, alignItems: 'center'}}><input type="radio" name="replicar" checked={!data.entity.replicar} onChange={() => updateField('entity.replicar', false)}/> Não</label>

                                                    </div></div>

                                                    {data.entity.replicar && (

                                                        <>

                                                            <label className="form-field"><span className="form-label">Dias a Replicar</span><input type="number" min={1} className="form-input" value={data.entity.diasReplicar ?? ''} onChange={(ev) => updateField('entity.diasReplicar', Number(ev.target.value))}/></label>

                                                            <div className="form-field"><span className="form-label">Detalhar Replicação</span><label style={{display: 'flex', gap: 6, alignItems: 'center'}}><input type="checkbox" checked={!!data.entity.detalharReplicacao} onChange={(ev) => updateField('entity.detalharReplicacao', ev.target.checked)}/> Sim</label></div>

                                                            {data.entity.detalharReplicacao && (

                                                                <>

                                                                    <label className="form-field"><span className="form-label">Componente Curricular</span><select className="form-input form-select" value={data.entity.componenteCurricularReplicarId ?? ''} onChange={(ev) => updateField('entity.componenteCurricularReplicarId', Number(ev.target.value))}><option value="">Selecione</option>{componentes.map((c) => <option key={c.id} value={c.id}>{c.descricao || c.sucinto || `Componente ${c.id}`}</option>)}</select></label>

                                                                    <div className="form-field" style={{gridColumn: 'span 3'}}><span className="form-label">Tipo</span><div style={{display: 'flex', gap: 14, flexWrap: 'wrap'}}>{TIPOS_REPLICACAO.map((t) => (<label key={t.valor} style={{display: 'flex', gap: 4, alignItems: 'center'}}><input type="radio" name="tipoReplicacao" checked={(data.entity.tipoReplicacao ?? 0) === t.valor} onChange={() => updateField('entity.tipoReplicacao', t.valor)}/> {t.rotulo}</label>))}</div></div>

                                                                </>

                                                            )}

                                                        </>

                                                    )}

                                                </div>

                                            </fieldset>

                                            <fieldset className="form-fieldset" style={{marginBottom: 16}}>

                                                <legend>Responsável</legend>

                                                <div className="form-grid">

                                                    <label className="form-field" style={{gridColumn: 'span 4'}}>

                                                        <span className="form-label">Responsável</span>

                                                        <AutoComplete

                                                            placeholder="Digite para buscar o usuário..."

                                                            value={null}

                                                            onChange={(opt) => {}}

                                                            fetchOptions={(q) => api.get('/api/view/usuario/listUsuario', {params: {q, limit: 20}}).then(r => (r.data ?? []).map((u: any) => ({id: u.id, label: u.nome || u.login || `#${u.id}`})))}

                                                            minChars={2}

                                                        />

                                                    </label>

                                                </div>

                                            </fieldset>

                                        </section>

                                    </div>

                                    <div role="tabpanel" id="panel-tabDiaAula" aria-labelledby="tab-tabDiaAula" hidden={activeTab !== 'tabDiaAula'}>

                                        <section className="tab-content">

                                            <fieldset className="form-fieldset" style={{marginBottom: 16}}>

                                                <legend>Dias Aula</legend>

                                                <div className="form-grid">

                                                    <label className="form-field"><span className="form-label">Sala *</span><div style={{display: 'flex', gap: 8, alignItems: 'flex-end'}}><select className="form-input form-select" style={{flex: 1}} value={data.entity.salaId ?? ''} onChange={(ev) => aoSelecionarSala(Number(ev.target.value))}><option value="">Selecione</option>{salasDaUnidade.map((s) => <option key={s.id} value={s.id}>{s.descricao || s.sucinto || `Sala ${s.id}`}</option>)}</select><button type="button" className="btnyellow" title="Consultar disponibilidade da sala" onClick={abrirModalSala}>Disponibilidade</button></div></label>

                                                    <label className="form-field"><span className="form-label">Qtde Sequência</span><input type="number" min={1} className="form-input" value={data.entity.qtdeSequencia ?? 1} onChange={(ev) => updateField('entity.qtdeSequencia', Math.max(1, Number(ev.target.value)))}/></label>

                                                    <label className="form-field"><span className="form-label">Data Inicial *</span><input type="date" className="form-input" value={data.entity.dataInicio ?? ''} onChange={(ev) => updateField('entity.dataInicio', ev.target.value)}/></label>

                                                    <label className="form-field"><span className="form-label">Data Fim</span><input type="date" className="form-input" value={data.entity.dataFim ?? ''} onChange={(ev) => updateField('entity.dataFim', ev.target.value)}/></label>

                                                    <label className="form-field"><span className="form-label">Quantidade de Aulas</span><input type="text" className="form-input" value={data.ocorrencias.length.toString()} readOnly/></label>

</div>

                                                 {idEdicao && existingDiasAula.length > 0 && (
                                                     <div style={{marginTop: 16}}>
                                                         <fieldset className="form-fieldset" style={{marginBottom: 16}}>
                                                             <legend>Dias de Aula Cadastrados</legend>
                                                             <table className="data-table" style={{width: '100%'}}>
                                                                 <thead>
                                                                     <tr>
                                                                         <th>Dia da Semana</th>
                                                                         <th>Turno</th>
                                                                         <th>Tempo de Aula</th>
                                                                     </tr>
                                                                 </thead>
                                                                 <tbody>
                                                                     {existingDiasAula.map((da) => (
                                                                         <tr key={da.id}>
                                                                             <td>{nomeDiaSemana(da.diaSemanaId)}</td>
                                                                             <td>{da.turnoEducacao_descricao ?? turnos.find((t) => t.id === da.turnoEducacaoId)?.descricao ?? turnos.find((t) => t.id === da.turnoEducacaoId)?.itemLabel ?? '-'}</td>
                                                                             <td>{da.tempoAula_descricao ?? tempoAulas.find((t) => t.id === da.tempoAulaId)?.descricao ?? '-'}</td>
                                                                         </tr>
                                                                     ))}
                                                                 </tbody>
                                                             </table>
                                                         </fieldset>
                                                     </div>
                                                 )}

                                                 <div style={{marginTop: 16}}>

                                                     <fieldset className="form-fieldset" style={{marginBottom: 16}}>

                                                         <legend>Configuração de Dias de Aula</legend>

                                                        <div style={{display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 12}}>

                                                            <div style={{flex: 1, minWidth: 200}}>

                                                                <label className="form-field" style={{display: 'flex', flexDirection: 'column', gap: 4}}>

                                                                    <span className="form-label">Dia da Semana *</span>

                                                                    <select className="form-input form-select" value={diaSemanaSelecionado.diaSemanaId ?? ''} onChange={(ev) => setDiaSemanaSelecionado({...diaSemanaSelecionado, diaSemanaId: Number(ev.target.value)})}>

                                                                        <option value="">Selecione</option>

                                                                        {diasSemana.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}

                                                                    </select>

                                                                </label>

                                                            </div>

                                                            <div style={{flex: 1, minWidth: 200}}>

                                                                <label className="form-field" style={{display: 'flex', flexDirection: 'column', gap: 4}}>

                                                                    <span className="form-label">Turno *</span>

                                                                    <select className="form-input form-select" value={diaSemanaSelecionado.turnoEducacaoId ?? ''} onChange={(ev) => setDiaSemanaSelecionado({...diaSemanaSelecionado, turnoEducacaoId: Number(ev.target.value)})}>

                                                                        <option value="">Selecione</option>

                                                                        {turnos.map((t) => <option key={t.id} value={t.id}>{t.descricao || t.itemLabel || `Turno ${t.id}`}</option>)}

                                                                    </select>

                                                                </label>

                                                            </div>

                                                            <div style={{flex: 1, minWidth: 200}}>

                                                                <label className="form-field" style={{display: 'flex', flexDirection: 'column', gap: 4}}>

                                                                    <span className="form-label">Tempo de Aula *</span>

                                                                    <select className="form-input form-select" value={diaSemanaSelecionado.tempoAulaId ?? ''} onChange={(ev) => setDiaSemanaSelecionado({...diaSemanaSelecionado, tempoAulaId: Number(ev.target.value)})}>

                                                                        <option value="">Selecione</option>

                                                                        {tempoAulas.map((t) => <option key={t.id} value={t.id}>{t.descricao || `Tempo ${t.id}`}</option>)}

                                                                    </select>

                                                                </label>

                                                            </div>

                                                            <button type="button" className="btnblue" onClick={() => {

                                                                const {diaSemanaId, turnoEducacaoId, tempoAulaId} = diaSemanaSelecionado;

                                                                if (!diaSemanaId || !turnoEducacaoId || !tempoAulaId) { alert('Preencha dia da semana, turno e tempo de aula'); return; }

                                                                const existe = diasSemanaConfigurados.find((c) => c.diaSemanaId === diaSemanaId && c.turnoEducacaoId === turnoEducacaoId && c.tempoAulaId === tempoAulaId);

                                                                if (existe) { alert('Esta configuração já foi adicionada'); return; }

                                                                const novaConfig = {key: `config-${Date.now()}`, diaSemanaId, turnoEducacaoId, tempoAulaId};

                                                                setDiasSemanaConfigurados((prev) => [...prev, novaConfig]);

                                                                const config: DiaAulaConfig = {diaSemanaId, turnoEducacaoId, tempoAulaId};

                                                                updateField('diasAulaConfig', [...dataRef.current.diasAulaConfig, config]);

                                                                setDiaSemanaSelecionado({diaSemanaId: undefined, turnoEducacaoId: undefined, tempoAulaId: undefined});

                                                            }} disabled={gerando}>

                                                                Adicionar

                                                            </button>

                                                        </div>

                                                        {diasSemanaConfigurados.length > 0 && (

                                                            <table className="data-table" style={{width: '100%'}}>

                                                                <thead><tr><th>Dia da Semana</th><th>Turno</th><th>Tempo de Aula</th><th style={{width: 60}}>Ação</th></tr></thead>

                                                                <tbody>

                                                                    {diasSemanaConfigurados.map((config) => (

                                                                        <tr key={config.key}>

                                                                            <td>{nomeDiaSemana(config.diaSemanaId)}</td>

                                                                            <td>{turnos.find((t) => t.id === config.turnoEducacaoId)?.descricao ?? turnos.find((t) => t.id === config.turnoEducacaoId)?.itemLabel ?? '-'}</td>

                                                                            <td>{tempoAulas.find((t) => t.id === config.tempoAulaId)?.descricao ?? '-'}</td>

                                                                            <td><button type="button" className="btn-action btnred" onClick={() => {

                                                                                setDiasSemanaConfigurados((prev) => prev.filter((c) => c.key !== config.key));

                                                                                updateField('diasAulaConfig', dataRef.current.diasAulaConfig.filter((c) => !(c.diaSemanaId === config.diaSemanaId && c.turnoEducacaoId === config.turnoEducacaoId && c.tempoAulaId === config.tempoAulaId)));

                                                                            }}><X className="icon" /></button></td>

                                                                        </tr>

                                                                    ))}

                                                                </tbody>

                                                            </table>

                                                        )}

                                                    </fieldset>

                                                </div>

                                                <div className="form-field" style={{marginTop: 12}}>

                                                    <button type="button" className="btnblue" onClick={gerarAulas} disabled={gerando || !data.entity.salaId || !data.entity.dataInicio || !data.entity.dataFim || !diasSemanaConfigurados.length}>

                                                        {gerando ? 'Gerando...' : 'Gerar Aulas'}

                                                    </button>

                                                </div>

                                                {data.ocorrencias.length > 0 && (

                                                    <table className="data-table" style={{width: '100%', marginTop: 12}}>

                                                        <thead><tr><th>Data</th><th>Dia Semana</th><th>Turno</th><th>Tempo Aula</th><th>Sala</th><th>Ação</th></tr></thead>

                                                        <tbody>{[...data.ocorrencias].sort((a, b) => a.data.localeCompare(b.data)).map((occ) => {const da = diaAulas.find((x) => x.id === occ.diaAulaId); const sala = salas.find((s) => s.id === occ.salaId); return (<tr key={occ.key}><td>{occ.data}</td><td>{nomeDiaSemana(da?.diaSemanaId)}</td><td>{da?.turnoEducacao_descricao ?? '-'}</td><td>{da?.tempoAula_descricao ?? '-'}</td><td>{sala?.descricao ?? sala?.sucinto ?? occ.salaId}</td><td><button type="button" className="btn-action btnred" onClick={() => removerOcorrencia(occ)}><X className="icon" /></button></td></tr>); })}</tbody>

                                                    </table>

                                                )}

                                                {data.invalidas.length > 0 && (

                                                    <table className="data-table" style={{width: '100%', marginTop: 12}}>

                                                        <thead><tr><th style={{width: 130}}>Data Inválida</th><th>Motivo</th></tr></thead>

                                                        <tbody>{data.invalidas.map((inv, idx) => (<tr key={`${inv.data}-${idx}`}><td style={{color: 'red'}}>{inv.data}</td><td style={{color: 'red'}}>{inv.motivo}</td></tr>))}</tbody>

                                                    </table>

                                                )}

                                            </fieldset>

                                            <fieldset className="form-fieldset" style={{marginBottom: 16}}>

                                                <legend>Vagas</legend>

                                                <div className="form-grid">

                                                    <label className="form-field"><span className="form-label">Vagas</span><input type="number" className="form-input" value={data.entity.vagas ?? ''} onChange={(ev) => updateField('entity', {...dataRef.current.entity, vagas: Number(ev.target.value)})}/><button type="button" className="btnblue" onClick={ajustarVagas}>Ajustar Vagas</button></label>

                                                    <label className="form-field"><span className="form-label">Registra Frequência</span><label style={{display: 'flex', gap: 6, alignItems: 'center'}}><input type="checkbox" checked={data.entity.registraFrequencia !== false} onChange={(ev) => updateField('entity', {...dataRef.current.entity, registraFrequencia: ev.target.checked})}/> Sim</label></label>

                                                    <label className="form-field"><span className="form-label">Possui Avaliação</span><label style={{display: 'flex', gap: 6, alignItems: 'center'}}><input type="checkbox" checked={data.entity.possuiAvaliacao !== false} onChange={(ev) => updateField('entity', {...dataRef.current.entity, possuiAvaliacao: ev.target.checked})}/> Sim</label></label>

                                                    <button type="button" className="btn-action btnyellow" style={{gridColumn: 'span 2'}} onClick={abrirModalOferta}>

                                                        Consulte os Oferecimentos

                                                    </button>

                                                </div>

                                            </fieldset>

                                        </section>

                                    </div>

                                    <div role="tabpanel" id="panel-tabProfessor" aria-labelledby="tab-tabProfessor" hidden={activeTab !== 'tabProfessor'}>

                                        <section className="tab-content">

                                            <fieldset className="form-fieldset">

                                                <legend>Professor</legend>

                                                <div className="form-grid">

                                                    <label className="form-field" style={{gridColumn: 'span 3'}}>

                                                        <span className="form-label">Responsável pela Turma</span>

                                                        <AutoComplete

                                                            placeholder="Digite para buscar o professor..."

                                                            value={data.professorId ? {id: data.professorId, label: professores.find(p => p.id === data.professorId)?.nome ?? ''} : null}

                                                            onChange={(opt) => updateField('professorId', opt?.id ?? null)}

                                                            fetchOptions={(q) => {

                                                                const firstDa = diaAulas.find(da => (data.diasAulaSelecionados ?? []).includes(da.id));

                                                                return fetchProfessor(q, firstDa?.diaSemanaId, firstDa?.turnoEducacaoId, firstDa?.tempoAulaId);

                                                            }}

                                                            fetchById={fetchProfessorById}

                                                            minChars={3}

                                                        />

                                                    </label>

                                                </div>

                                            </fieldset>

                                        </section>

                                    </div>

                                </div>

                                <div className="ofc-tabs-actions">

                                    <button type="button" className="btn-form-back" onClick={voltarAbaOuLista} disabled={gerando}>Anterior</button>

                                    <button type="button" className="btn-form-save" onClick={proximaAbaOuSalvar} disabled={gerando}>{saveLabel}</button>

                                </div>

                            </div>

                        </div>

                    </div>

            <Modal title="Disponibilidade dos Oferecimentos" open={modalOfertaOpen} onClose={() => setModalOfertaOpen(false)} size="xl">
                <ScheduleWeekView
                    startDate={modalOfertaWeekStart}
                    onWeekChange={mudarSemanaModalOferta}
                    events={modalOfertaEvents}
                    loading={modalOfertaLoading}
                    legend={LEGENDA_OFERECIMENTO}
                />
            </Modal>
            <Modal title="Disponibilidade da Sala" open={modalSalaOpen} onClose={() => setModalSalaOpen(false)} size="xl">
                <ScheduleWeekView
                    startDate={modalSalaWeekStart}
                    onWeekChange={mudarSemanaModalSala}
                    events={modalSalaEvents}
                    loading={modalSalaLoading}
                    legend={LEGENDA_OFERECIMENTO}
                />
            </Modal>

            </main>

        </PermissionGate>

    );

}







