import {useEffect, useMemo, useRef, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {PermissionGate} from '../permissions';
import {Wizard, useWizardData} from '../Wizard';
import {api, useApi} from '../api';

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
    diasAulaSelecionados: number[];
    ocorrencias: OcorrenciaLocal[];
    invalidas: InvalidaData[];
    professorId?: number | null;
}

const DIAS_NOMES = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

const TIPOS_REPLICACAO = [
    {valor: 0, rotulo: 'Na data inicio'},
    {valor: 1, rotulo: 'Após data inicio'},
    {valor: 2, rotulo: 'Na data fim'},
    {valor: 3, rotulo: 'Após data fim'},
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

export default function ViewOferecimentoComponenteCurricularFormOferecimentoComponenteCurricularListScreen() {
    const [searchParams] = useSearchParams();
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
    const [professoresTurmaIds, setProfessoresTurmaIds] = useState<number[] | null>(null);
    const [gerando, setGerando] = useState(false);

    const {data, updateField, updateFields} = useWizardData<OferecimentoCCData>({
        entity: {},
        novoGrupo: false,
        novoGrupoNome: '',
        diasAulaSelecionados: [],
        ocorrencias: [],
        invalidas: [],
        professorId: null,
    });

    const dataRef = useRef(data);
    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    const ofcApi = useApi<any>('/api/educacao/oferecimento-componente-curricular');

    useEffect(() => {
        (async () => {
            try {
                const [uns, curs, comps, grps, sls, das] = await Promise.all([
                    api.get('/api/basico/unidade'),
                    api.get('/api/educacao/curriculo'),
                    api.get('/api/educacao/componente-curricular'),
                    api.get('/api/educacao/grupo'),
                    api.get('/api/educacao/sala'),
                    api.get('/api/educacao/dia-aula'),
                ]);
                setUnidades(uns ?? []);
                setCurriculos(curs ?? []);
                setComponentes(comps ?? []);
                setGrupos(grps ?? []);
                setSalas(sls ?? []);
                setDiaAulas(das ?? []);
                try {
                    setDiasSemana(await api.get('/api/view/dia-semana'));
                } catch {
                    setDiasSemana([]);
                }
                try {
                    setProfessores(await api.get('/api/professor/professor'));
                } catch {
                    setProfessores([]);
                }
                if (idEdicao) {
                    try {
                        const ent = await api.get(`/api/educacao/oferecimento-componente-curricular/${idEdicao}`);
                        const todas = await api.get('/api/educacao/ocorrencia-componente-curricular');
                        const minhas: any[] = (todas ?? []).filter(
                            (o: any) => o.oferecimentoComponenteCurricularId === Number(idEdicao),
                        );
                        const ocorrencias: OcorrenciaLocal[] = minhas.map((o) => ({
                            key: `db-${o.id}`,
                            id: o.id,
                            data: fmtDate(parseISO(o.data) ?? new Date()),
                            diaAulaId: o.diaAulaId,
                            salaId: o.salaId,
                            aulaCoringa: !!o.aulaCoringa,
                            aulaPresencial: o.aulaPresencial !== false,
                            ativo: o.ativo !== false,
                        }));
                        updateFields({
                            entity: {
                                ...ent,
                                dataCancelamento: ent.dataCancelamento ? fmtDate(parseISO(ent.dataCancelamento)!) : null,
                            },
                            novoGrupo: false,
                            novoGrupoNome: '',
                            diasAulaSelecionados: [...new Set(minhas.map((o) => o.diaAulaId).filter(Boolean))] as number[],
                            ocorrencias,
                            invalidas: [],
                            professorId: ent.professorId ?? minhas.find((o) => o.professorId)?.professorId ?? null,
                        });
                        if (ent.unidadeId) {
                            try {
                                setCursosDaUnidadeIds(
                                    await api.get('/api/educacao/curriculo/buscar-cursos-da-unidade', {params: {unidadeId: ent.unidadeId}}) ?? [],
                                );
                            } catch {
                                setCursosDaUnidadeIds([]);
                            }
                        }
                        if (ent.curriculoId) {
                            try {
                                setMatrizIds(
                                    await api.get('/api/educacao/oferecimento-componente-curricular/buscar-matriz-curricular', {params: {curriculoId: ent.curriculoId}}) ?? [],
                                );
                            } catch {
                                setMatrizIds([]);
                            }
                        }
                    } catch {
                        alert('Não foi possível carregar o oferecimento para edição');
                    }
                }
            } finally {
                setCarregando(false);
            }
        })();
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

    const gruposDisponiveis = useMemo(
        () => grupos.filter((g) => g.unidadeId === data.entity.unidadeId && g.curriculoId === data.entity.curriculoId),
        [grupos, data.entity.unidadeId, data.entity.curriculoId],
    );

    const salasDaUnidade = useMemo(
        () => salas.filter((s) => s.unidadeId === data.entity.unidadeId),
        [salas, data.entity.unidadeId],
    );

    const professoresParaTurma = useMemo(() => {
        if (!professoresTurmaIds) return professores;
        return professores.filter((p) => professoresTurmaIds.includes(p.id));
    }, [professores, professoresTurmaIds]);

    const nomeDiaSemana = (diaSemanaId?: number): string =>
        diasSemana.find((d) => d.id === diaSemanaId)?.nome ?? DIAS_NOMES[(((diaSemanaId ?? 1) - 1) % 7)];

    const rotuloDiaAula = (da: any): string => {
        const partes = [
            nomeDiaSemana(da.diaSemanaId),
            da.turnoEducacao_descricao,
            da.tempoAula_descricao,
        ].filter(Boolean);
        return partes.join(' • ');
    };

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
        updateFields({
            entity: {...dataRef.current.entity, unidadeId: valor, curriculoId: undefined, componenteCurricularId: undefined},
        });
        try {
            setCursosDaUnidadeIds(
                await api.get('/api/educacao/curriculo/buscar-cursos-da-unidade', {params: {unidadeId: valor}}) ?? [],
            );
        } catch {
            setCursosDaUnidadeIds([]);
        }
    };

    const aoSelecionarCurso = async (valor: number) => {
        updateFields({
            entity: {...dataRef.current.entity, curriculoId: valor, componenteCurricularId: undefined},
        });
        try {
            setMatrizIds(
                await api.get('/api/educacao/oferecimento-componente-curricular/buscar-matriz-curricular', {params: {curriculoId: valor}}) ?? [],
            );
        } catch {
            setMatrizIds([]);
        }
    };

    const aoSelecionarSala = (valor: number) => {
        const atual = dataRef.current;
        updateFields({
            entity: {...atual.entity, salaId: valor, vagas: calcularVagas(valor, atual.entity.curriculoId)},
        });
    };

    const ajustarVagas = () => {
        const atual = dataRef.current;
        updateFields({
            entity: {...atual.entity, vagas: calcularVagas(atual.entity.salaId, atual.entity.curriculoId)},
        });
    };

    const alternarDiaAula = (id: number) => {
        const atuais = dataRef.current.diasAulaSelecionados;
        updateField('diasAulaSelecionados',
            atuais.includes(id) ? atuais.filter((x) => x !== id) : [...atuais, id]);
    };

    const removerOcorrencia = async (occ: OcorrenciaLocal) => {
        if (occ.id) {
            try {
                await api.delete(`/api/educacao/ocorrencia-componente-curricular/${occ.id}`);
            } catch {
                alert('Não foi possível remover a aula salva');
                return;
            }
        }
        updateField('ocorrencias', dataRef.current.ocorrencias.filter((o) => o.key !== occ.key));
    };

    const gerarAulas = async () => {
        const atual = dataRef.current;
        const e = atual.entity;
        if (!e.unidadeId || !e.curriculoId || !e.salaId) {
            alert('Selecione unidade, curso e sala antes de gerar as aulas');
            return;
        }
        if (!atual.diasAulaSelecionados.length) {
            alert('Selecione pelo menos um dia de aula');
            return;
        }
        if (!e.dataInicio || !e.dataFim) {
            alert('Defina as datas de início e fim do oferecimento');
            return;
        }
        if (e.dataInicio > e.dataFim) {
            alert('A data inicial deve ser anterior ou igual à data final');
            return;
        }

        setGerando(true);
        try {
            const feriadoMap = new Map<string, string>();
            try {
                const ids = await api.get('/api/basico/feriado/buscar-feriado-da-unidade-list', {
                    params: {unidade: e.unidadeId, inicio: e.dataInicio, fim: e.dataFim},
                });
                if (Array.isArray(ids) && ids.length) {
                    const todos = await api.get('/api/basico/feriado');
                    for (const f of todos ?? []) {
                        if (ids.includes(f.id)) {
                            const dFer = parseISO(f.dataFeriado);
                            if (dFer) feriadoMap.set(fmtDate(dFer), f.nome ?? 'Feriado');
                        }
                    }
                }
            } catch {
                feriadoMap.clear();
            }

            let criterio: any = null;
            try {
                const idsCriterio = await api.get('/api/educacao/criterio/buscar-criterio', {
                    params: {curriculoId: e.curriculoId, unidadeId: e.unidadeId},
                });
                if (Array.isArray(idsCriterio) && idsCriterio.length) {
                    criterio = await api.get(`/api/educacao/criterio/${idsCriterio[0]}`);
                }
            } catch {
                criterio = null;
            }
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
                    if (!atual.diasAulaSelecionados.includes(da.id)) continue;
                    if (numeroDiaSemana(nomeDiaSemana(da.diaSemanaId), da.diaSemanaId) !== diaSemanaData) continue;
                    const feriado = feriadoMap.get(iso);
                    if (feriado) {
                        invalidas.push({data: iso, motivo: feriado});
                        continue;
                    }
                    if (critInicio && iso < fmtDate(critInicio)) {
                        invalidas.push({data: iso, motivo: 'Existe um critério definido para o inicio das aulas'});
                        continue;
                    }
                    if (critFim && iso > fmtDate(critFim)) {
                        invalidas.push({data: iso, motivo: 'Existe um critério definido para o fim das aulas'});
                        continue;
                    }
                    if (existentes.some((o) => o.data === iso && o.salaId === e.salaId && o.diaAulaId === da.id)) {
                        invalidas.push({data: iso, motivo: `Aula marcada na turma ${salas.find((s) => s.id === e.salaId)?.descricao ?? e.salaId}`});
                        continue;
                    }
                    const nova: OcorrenciaLocal = {
                        key: `${iso}-${da.id}`,
                        data: iso,
                        diaAulaId: da.id,
                        salaId: e.salaId,
                        aulaCoringa: false,
                        aulaPresencial: true,
                        ativo: true,
                    };
                    existentes.push(nova);
                    novas.push(nova);
                }
                cursor.setDate(cursor.getDate() + 1);
            }

            updateFields({ocorrencias: existentes, invalidas});
            alert(`Aulas geradas: ${novas.length}. Datas ignoradas: ${invalidas.length}`);
        } finally {
            setGerando(false);
        }
    };

    const validarEtapa1 = (): string | boolean => {
        const d = dataRef.current;
        if (!d.entity.unidadeId) return 'Selecione a unidade';
        if (!d.entity.curriculoId) return 'Selecione o curso';
        if (!d.entity.componenteCurricularId) return 'Selecione o componente curricular';
        if (d.novoGrupo && !d.novoGrupoNome.trim()) return 'Informe o nome do grupo';
        if (!d.novoGrupo && !d.entity.grupoId) return 'Selecione o grupo';
        return true;
    };

    const validarEtapa2 = (): string | boolean => {
        const d = dataRef.current;
        if (!d.ocorrencias.length) return 'Defina os dias de aula';
        if (!d.entity.vagas) return 'O número de vagas deve ser maior que zero';
        return true;
    };

    const prepararEtapa3 = async () => {
        const d = dataRef.current;
        if (d.entity.vagas === 0) {
            alert('O número de vagas não pode ser zero');
            return;
        }
        if (!d.ocorrencias.length) {
            alert('Defina os dias de aula antes de escolher o professor');
            return;
        }
        try {
            const ids = await api.get('/api/professor/professor/buscar-lista-professores-para-turma', {
                params: {componenteCurricularId: d.entity.componenteCurricularId, unidadeId: d.entity.unidadeId},
            });
            const lista = Array.isArray(ids) ? ids : [];
            setProfessoresTurmaIds(lista.length ? lista : null);
            if (!d.professorId && lista.length) {
                updateField('professorId', lista[0]);
            }
        } catch {
            setProfessoresTurmaIds(null);
        }
    };

    const salvar = async () => {
        const d = dataRef.current;
        const e = d.entity;
        if (!validarEtapa1() || validarEtapa2() !== true) {
            alert('Verifique os dados das etapas anteriores');
            return;
        }
        if (!d.professorId) {
            alert('Selecione o responsável pela turma');
            return;
        }
        try {
            let grupoId = e.grupoId;
            if (d.novoGrupo) {
                const nome = d.novoGrupoNome.trim();
                const existente = gruposDisponiveis.find((g) => (g.nome ?? '').toLowerCase() === nome.toLowerCase());
                grupoId = existente
                    ? existente.id
                    : (await api.post('/api/educacao/grupo', {nome, unidadeId: e.unidadeId, curriculoId: e.curriculoId}))?.id;
                if (!grupoId) {
                    alert('Não foi possível criar o grupo');
                    return;
                }
            }

            const datas = d.ocorrencias.map((o) => o.data).sort();
            const payload = {
                unidadeId: e.unidadeId,
                grupoId,
                salaId: e.salaId,
                curriculoId: e.curriculoId,
                componenteCurricularId: e.componenteCurricularId,
                professorId: d.professorId,
                vagas: e.vagas,
                inscritos: 0,
                dataInicio: datas[0],
                dataFim: datas[datas.length - 1],
                dataAlteracao: new Date().toISOString(),
                tipoReplicacao: e.replicar ? (e.tipoReplicacao ?? 0) : 0,
                diasReplicar: e.replicar ? e.diasReplicar : null,
                qtdeSequencia: e.qtdeSequencia ?? 1,
                registraFrequencia: e.registraFrequencia !== false,
                possuiAvaliacao: e.possuiAvaliacao !== false,
                replicar: !!e.replicar,
                replicado: false,
                detalharReplicacao: !!e.detalharReplicacao,
                componenteCurricularReplicarId: e.detalharReplicacao ? e.componenteCurricularReplicarId : null,
                status: e.status ?? 0,
                sequencia: e.sequencia ?? 0,
            };

            const salvo = e.id ? await ofcApi.put(e.id, payload) : await ofcApi.post(payload);
            const oferecimentoId = salvo?.id ?? e.id;

            for (const occ of d.ocorrencias.filter((o) => !o.id)) {
                await api.post('/api/educacao/ocorrencia-componente-curricular', {
                    professorId: d.professorId,
                    salaId: occ.salaId ?? e.salaId,
                    ativo: true,
                    oferecimentoComponenteCurricularId: oferecimentoId,
                    data: occ.data,
                    diaAulaId: occ.diaAulaId,
                    aulaCoringa: false,
                    aulaPresencial: true,
                });
            }

            alert('Oferecimento salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar oferecimento');
        }
    };

    if (carregando) {
        return (
            <PermissionGate permission="READ">
                <main>
                    <h1>Form Oferecimento Componente Curricular</h1>
                    <div className="div_form">
                        <p className="master-detail-empty">Carregando...</p>
                    </div>
                </main>
            </PermissionGate>
        );
    }

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Oferecimento Componente Curricular</h1>
                <div className="div_form">
                    <div className="form-title">Oferecimento Componente Curricular</div>
                    <div className="table_form">
                        <Wizard
                            initialData={data}
                            onDataChange={updateFields}
                            steps={[
                                {
                                    key: 'tabComponenteCurricular',
                                    label: 'Componente Curricular',
                                    content: (
                                        <div>
                                            <fieldset>
                                                <legend>Grupo</legend>
                                                <p>
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            checked={data.novoGrupo}
                                                            onChange={(ev) => updateField('novoGrupo', ev.target.checked)}
                                                        />
                                                        {' '}Novo grupo
                                                    </label>
                                                </p>
                                                {data.novoGrupo ? (
                                                    <p>
                                                        <label>Nome do Grupo:</label>
                                                        <input
                                                            type="text"
                                                            value={data.novoGrupoNome}
                                                            onChange={(ev) => updateField('novoGrupoNome', ev.target.value)}
                                                        />
                                                    </p>
                                                ) : (
                                                    <p>
                                                        <label>Grupo:</label>
                                                        <select
                                                            value={data.entity.grupoId ?? ''}
                                                            onChange={(ev) => updateField('entity.grupoId', Number(ev.target.value))}
                                                        >
                                                            <option value="">Selecione</option>
                                                            {gruposDisponiveis.map((g) => (
                                                                <option key={g.id} value={g.id}>{g.nome}</option>
                                                            ))}
                                                        </select>
                                                    </p>
                                                )}
                                            </fieldset>
                                            <fieldset>
                                                <legend>Geral</legend>
                                                <p>
                                                    <label>ID:</label>
                                                    <input type="text" value={data.entity.id ?? ''} disabled/>
                                                </p>
                                                <p>
                                                    <label>Unidade:</label>
                                                    <select
                                                        value={data.entity.unidadeId ?? ''}
                                                        onChange={(ev) => aoSelecionarUnidade(Number(ev.target.value))}
                                                    >
                                                        <option value="">Selecione</option>
                                                        {unidades.map((u) => (
                                                            <option key={u.id} value={u.id}>
                                                                {u.nomeFantasia || u.razaoSocial || u.sucinto || `Unidade ${u.id}`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </p>
                                                <p>
                                                    <label>Curso:</label>
                                                    <select
                                                        value={data.entity.curriculoId ?? ''}
                                                        onChange={(ev) => aoSelecionarCurso(Number(ev.target.value))}
                                                    >
                                                        <option value="">Selecione</option>
                                                        {cursosDisponiveis.map((c) => (
                                                            <option key={c.id} value={c.id}>
                                                                {c.descricao || c.sigla || `Curso ${c.id}`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </p>
                                                <p>
                                                    <label>Componente Curricular:</label>
                                                    <select
                                                        value={data.entity.componenteCurricularId ?? ''}
                                                        onChange={(ev) => updateField('entity.componenteCurricularId', Number(ev.target.value))}
                                                    >
                                                        <option value="">Selecione</option>
                                                        {componentesDoCurso.map((c) => (
                                                            <option key={c.id} value={c.id}>
                                                                {c.descricao || c.sucinto || `Componente ${c.id}`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </p>
                                                <p>
                                                    <label>Data Cancelamento:</label>
                                                    <input type="date" value={data.entity.dataCancelamento ?? ''} disabled/>
                                                </p>
                                            </fieldset>
                                            <fieldset>
                                                <legend>Replicar</legend>
                                                <p>
                                                    <label>Replicar?</label>
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            name="replicar"
                                                            checked={!!data.entity.replicar}
                                                            onChange={() => updateField('entity.replicar', true)}
                                                        />
                                                        {' '}Sim
                                                    </label>
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            name="replicar"
                                                            checked={!data.entity.replicar}
                                                            onChange={() => updateField('entity.replicar', false)}
                                                        />
                                                        {' '}Não
                                                    </label>
                                                </p>
                                                {data.entity.replicar && (
                                                    <>
                                                        <p>
                                                            <label>Dias a Replicar:</label>
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                value={data.entity.diasReplicar ?? ''}
                                                                onChange={(ev) => updateField('entity.diasReplicar', Number(ev.target.value))}
                                                            />
                                                        </p>
                                                        <p>
                                                            <label>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!data.entity.detalharReplicacao}
                                                                    onChange={(ev) => updateField('entity.detalharReplicacao', ev.target.checked)}
                                                                />
                                                                {' '}Detalhar Replicação
                                                            </label>
                                                        </p>
                                                        <p>
                                                            <label>Componente Curricular Replicar:</label>
                                                            <select
                                                                value={data.entity.componenteCurricularReplicarId ?? ''}
                                                                onChange={(ev) => updateField('entity.componenteCurricularReplicarId', Number(ev.target.value))}
                                                            >
                                                                <option value="">Selecione</option>
                                                                {componentes.map((c) => (
                                                                    <option key={c.id} value={c.id}>
                                                                        {c.descricao || c.sucinto || `Componente ${c.id}`}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </p>
                                                        <p>
                                                            <label>Tipo Replicação:</label>
                                                            {TIPOS_REPLICACAO.map((t) => (
                                                                <label key={t.valor}>
                                                                    <input
                                                                        type="radio"
                                                                        name="tipoReplicacao"
                                                                        checked={(data.entity.tipoReplicacao ?? 0) === t.valor}
                                                                        onChange={() => updateField('entity.tipoReplicacao', t.valor)}
                                                                    />
                                                                    {' '}{t.rotulo}
                                                                </label>
                                                            ))}
                                                        </p>
                                                    </>
                                                )}
                                            </fieldset>
                                        </div>
                                    ),
                                    validate: validarEtapa1,
                                },
                                {
                                    key: 'tabDiaAula',
                                    label: 'Dias Aula',
                                    content: (
                                        <div>
                                            <fieldset>
                                                <legend>Dias Aula</legend>
                                                <p>
                                                    <label>Sala:</label>
                                                    <select
                                                        value={data.entity.salaId ?? ''}
                                                        onChange={(ev) => aoSelecionarSala(Number(ev.target.value))}
                                                    >
                                                        <option value="">Selecione</option>
                                                        {salasDaUnidade.map((s) => (
                                                            <option key={s.id} value={s.id}>
                                                                {s.descricao || s.sucinto || `Sala ${s.id}`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </p>
                                                <p>
                                                    <label>Quantidade Sequência:</label>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        value={data.entity.qtdeSequencia ?? 1}
                                                        onChange={(ev) => updateField('entity.qtdeSequencia', Math.max(1, Number(ev.target.value)))}
                                                    />
                                                </p>
                                                <p>
                                                    <label>Data Início:</label>
                                                    <input
                                                        type="date"
                                                        value={data.entity.dataInicio ?? ''}
                                                        onChange={(ev) => updateField('entity.dataInicio', ev.target.value)}
                                                    />
                                                    <label>Data Fim:</label>
                                                    <input
                                                        type="date"
                                                        value={data.entity.dataFim ?? ''}
                                                        onChange={(ev) => updateField('entity.dataFim', ev.target.value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn-form-save"
                                                        onClick={gerarAulas}
                                                        disabled={gerando}
                                                    >
                                                        {gerando ? 'Gerando...' : 'Gerar Aulas'}
                                                    </button>
                                                </p>
                                                <p>
                                                    <strong>Dias de aula:</strong>
                                                    {diaAulas.map((da) => (
                                                        <label key={da.id} style={{display: 'block'}}>
                                                            <input
                                                                type="checkbox"
                                                                checked={data.diasAulaSelecionados.includes(da.id)}
                                                                onChange={() => alternarDiaAula(da.id)}
                                                            />
                                                            {' '}{rotuloDiaAula(da)}
                                                        </label>
                                                    ))}
                                                </p>
                                                {data.ocorrencias.length > 0 && (
                                                    <table className="table_form" style={{width: '100%'}}>
                                                        <thead>
                                                        <tr>
                                                            <th>Data</th>
                                                            <th>Dia Semana</th>
                                                            <th>Turno</th>
                                                            <th>Tempo Aula</th>
                                                            <th>Sala</th>
                                                            <th>Ação</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {[...data.ocorrencias]
                                                            .sort((a, b) => a.data.localeCompare(b.data))
                                                            .map((occ) => {
                                                                const da = diaAulas.find((x) => x.id === occ.diaAulaId);
                                                                const sala = salas.find((s) => s.id === occ.salaId);
                                                                return (
                                                                    <tr key={occ.key}>
                                                                        <td>{occ.data}</td>
                                                                        <td>{nomeDiaSemana(da?.diaSemanaId)}</td>
                                                                        <td>{da?.turnoEducacao_descricao ?? '-'}</td>
                                                                        <td>{da?.tempoAula_descricao ?? '-'}</td>
                                                                        <td>{sala?.descricao ?? sala?.sucinto ?? occ.salaId}</td>
                                                                        <td>
                                                                            <button
                                                                                type="button"
                                                                                className="btn-form-back"
                                                                                onClick={() => removerOcorrencia(occ)}
                                                                            >
                                                                                Remover
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                )}
                                                {data.invalidas.length > 0 && (
                                                    <ul>
                                                        {data.invalidas.map((inv, idx) => (
                                                            <li key={`${inv.data}-${idx}`}>
                                                                {inv.data}: {inv.motivo}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </fieldset>
                                            <fieldset>
                                                <legend>Vagas</legend>
                                                <p>
                                                    <label>Vagas:</label>
                                                    <input type="number" value={data.entity.vagas ?? ''} disabled/>
                                                    <button type="button" className="btn-form-save" onClick={ajustarVagas}>
                                                        Ajustar Vagas
                                                    </button>
                                                </p>
                                            </fieldset>
                                        </div>
                                    ),
                                    validate: validarEtapa2,
                                },
                                {
                                    key: 'tabProfessor',
                                    label: 'Professor',
                                    nextLabel: 'Salvar',
                                    onEnter: prepararEtapa3,
                                    content: (
                                        <div>
                                            <fieldset>
                                                <legend>Professor</legend>
                                                <p>
                                                    <label>Responsável pela Turma:</label>
                                                    <select
                                                        value={data.professorId ?? ''}
                                                        onChange={(ev) => updateField('professorId', Number(ev.target.value))}
                                                    >
                                                        <option value="">Selecione</option>
                                                        {professoresParaTurma.map((p) => (
                                                            <option key={p.id} value={p.id}>
                                                                Professor {p.pessoaId ?? p.id}{p.ativo === false ? ' (inativo)' : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </p>
                                                <p>
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            checked={data.entity.registraFrequencia !== false}
                                                            onChange={(ev) => updateField('entity.registraFrequencia', ev.target.checked)}
                                                        />
                                                        {' '}Registra Frequência
                                                    </label>
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            checked={data.entity.possuiAvaliacao !== false}
                                                            onChange={(ev) => updateField('entity.possuiAvaliacao', ev.target.checked)}
                                                        />
                                                        {' '}Possui Avaliação
                                                    </label>
                                                </p>
                                            </fieldset>
                                        </div>
                                    ),
                                },
                            ]}
                            onComplete={salvar}
                        />
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}
