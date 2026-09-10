import {useCallback, useEffect, useState} from 'react';

import {useNavigate, useSearchParams} from 'react-router-dom';

import {PermissionGate, usePermissions} from '../../../shared/services/permissions';

import {api} from '../../../shared/services/api';

import {AutoComplete} from '../../../shared/components/AutoComplete';

import type {AutoCompleteOption} from '../../../shared/components/AutoComplete';



interface UnidadeRow {

    id: number;

    sucinto?: string | null;

    nome_fantasia?: string | null;

    nomeFantasia?: string | null;

    fl_ativo?: boolean | null;

    flAtivo?: boolean | null;

}



interface CurriculoRow {

    id: number;

    descricao?: string | null;

    sucinto?: string | null;

    sigla?: string | null;

    curso_descricao?: string | null;

    cursoDescricao?: string | null;

}



interface CriterioApi {

    id: number;

    unidadeId: number;

    curriculoId: number;

    mes: boolean;

    periodo: number;

    qtdTurmaAbertas: number;

    qtdAulasToleraciaMatricula: number;

    dataInicio: string | number | null;

    dataFim: string | number | null;

    tipoMatricula: string | null;

}



const apiErrorMessage = (error: unknown): string =>

    (error as { response?: { data?: { error?: string } } })?.response?.data?.error

        ?? (error as { response?: { data?: { message?: string } } })?.response?.data?.message

        ?? (error as Error)?.message

        ?? 'erro desconhecido';



const pick = (row: Record<string, unknown>, keys: string[]): string => {

    for (const key of keys) {

        const value = row[key];

        if (value !== null && value !== undefined && String(value).trim() !== '') return String(value);

    }

    return '';

};



const toIsoDate = (value: unknown): string => {

    if (value === null || value === undefined || value === '') return '';

    if (typeof value === 'number') {

        const data = new Date(value);

        const mes = String(data.getMonth() + 1).padStart(2, '0');

        const dia = String(data.getDate()).padStart(2, '0');

        return `${data.getFullYear()}-${mes}-${dia}`;

    }

    return String(value).slice(0, 10);

};



const soNumeros = (value: string): string => value.replace(/\D/g, '');



const cursoLabel = (row: CurriculoRow): string => {

    const nome = pick(row as unknown as Record<string, unknown>, ['curso_descricao', 'cursoDescricao']);

    const sucinto = pick(row as unknown as Record<string, unknown>, ['sucinto']);

    if (nome && sucinto) return `${nome}: ${sucinto}`;

    return pick(row as unknown as Record<string, unknown>, ['descricao', 'sucinto', 'sigla']) || `#${row.id}`;

};



const unidadeLabel = (row: UnidadeRow): string =>

    pick(row as unknown as Record<string, unknown>, ['sucinto', 'nomeFantasia', 'nome_fantasia']) || `#${row.id}`;



const TIPOS_MATRICULA = ['LIVRE', 'GRUPO'];



export default function ViewCriterioListCriterioFormScreen() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const {can} = usePermissions();

    const outcomeLista = '/view/criterio/listCriterio';

    const idEdicao = searchParams.get('id');



    const [carregando, setCarregando] = useState(!!idEdicao);

    const [salvando, setSalvando] = useState(false);

    const [mensagem, setMensagem] = useState('');

    const [criterioId, setCriterioId] = useState<number | null>(idEdicao ? Number(idEdicao) : null);

    const [curriculoIdCarregado, setCurriculoIdCarregado] = useState<number | null>(null);



    const [todos, setTodos] = useState(false);

    const [unidadeId, setUnidadeId] = useState<number | null>(null);

    const [curso, setCurso] = useState<AutoCompleteOption | null>(null);

    const [tipoMatricula, setTipoMatricula] = useState('LIVRE');

    const [aulasTolerancia, setAulasTolerancia] = useState('');

    const [dataInicio, setDataInicio] = useState('');

    const [dataFim, setDataFim] = useState('');

    // Campos ocultos na tela do legado, preservados para não zerar ao salvar

    const [ocultos, setOcultos] = useState({mes: true, periodo: 0, qtdTurmaAbertas: 0});



    const [unidades, setUnidades] = useState<UnidadeRow[]>([]);

    useEffect(() => {

        let ativo = true;

        (async () => {

            try {

                const {data} = await api.get<UnidadeRow[]>('/api/view/unidade/listUnidade');

                if (!ativo) return;

                setUnidades((data ?? []).filter(u => u.fl_ativo !== false && u.flAtivo !== false));

            } catch {

                if (ativo) setUnidades([]);

            }

        })();

        return () => {

            ativo = false;

        };

    }, []);



    const [curriculos, setCurriculos] = useState<CurriculoRow[]>([]);

    useEffect(() => {

        let ativo = true;

        (async () => {

            try {

                const {data} = await api.get<Array<Record<string, unknown>>>('/api/view/curriculo/listCurriculo');

                if (!ativo) return;

                setCurriculos((data ?? []).map(row => ({...(row as unknown as CurriculoRow), id: Number(row.id)})));

            } catch {

                if (ativo) setCurriculos([]);

            }

        })();

        return () => {

            ativo = false;

        };

    }, []);



    const aplicarCriterio = useCallback((registro: CriterioApi) => {

        setCriterioId(registro.id);

        setTipoMatricula(registro.tipoMatricula ?? 'LIVRE');

        setAulasTolerancia(String(registro.qtdAulasToleraciaMatricula ?? 0));

        setDataInicio(toIsoDate(registro.dataInicio));

        setDataFim(toIsoDate(registro.dataFim));

        setOcultos({

            mes: registro.mes ?? true,

            periodo: registro.periodo ?? 0,

            qtdTurmaAbertas: registro.qtdTurmaAbertas ?? 0,

        });

    }, []);



    // Carrega um critério existente pelo ?id= da rota de edição

    useEffect(() => {

        if (!idEdicao) return;

        let ativo = true;

        (async () => {

            try {

                const {data} = await api.get<CriterioApi>(`/api/educacao/criterio/${idEdicao}`);

                if (!ativo) return;

                aplicarCriterio(data);

                setUnidadeId(data.unidadeId);

                setCurriculoIdCarregado(data.curriculoId);

            } catch (erro) {

                console.error('Erro ao carregar critério:', erro);

                alert('Não foi possível carregar o critério para edição');

            } finally {

                if (ativo) setCarregando(false);

            }

        })();

        return () => {

            ativo = false;

        };

    }, [idEdicao, aplicarCriterio]);



    // Resolve o rótulo do curso carregado na edição a partir da lista de currículos

    useEffect(() => {

        if (curso || curriculoIdCarregado === null || curriculos.length === 0) return;

        const achado = curriculos.find(c => c.id === curriculoIdCarregado);

        setCurso({id: curriculoIdCarregado, label: achado ? cursoLabel(achado) : `#${curriculoIdCarregado}`});

    }, [curriculos, curriculoIdCarregado, curso]);



    const buscarCursos = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {

        const termo = query.trim().toLowerCase();

        const filtrados = termo

            ? curriculos.filter(c => [

                c.descricao, c.sucinto, c.sigla, c.curso_descricao, c.cursoDescricao,

              ].some(valor => valor?.toLowerCase().includes(termo)))

            : curriculos.slice(0, 10);

        return filtrados.slice(0, 10).map(c => ({id: c.id, label: cursoLabel(c)}));

    }, [curriculos]);



    // Equivalente a #{criterioController.populaCriterio} do listCriterio.xhtml:

    // ao selecionar curso + unidade, carrega o critério já existente para edição.

    const populaCriterio = useCallback(async (cursoSelecionado: AutoCompleteOption | null) => {

        if (!cursoSelecionado || todos || !unidadeId) return;

        try {

            const {data: ids} = await api.get<number[]>('/api/educacao/criterio/buscar-criterio', {

                params: {curriculoId: cursoSelecionado.id, unidadeId},

            });

            if (Array.isArray(ids) && ids.length > 0) {

                const {data} = await api.get<CriterioApi>(`/api/educacao/criterio/${ids[0]}`);

                aplicarCriterio(data);

                setMensagem(`Critério #${data.id} carregado para edição.`);

            } else {

                setCriterioId(null);

                setTipoMatricula('LIVRE');

                setAulasTolerancia('');

                setDataInicio('');

                setDataFim('');

                setOcultos({mes: true, periodo: 0, qtdTurmaAbertas: 0});

                setMensagem('');

            }

        } catch {

            setMensagem('');

        }

    }, [todos, unidadeId, aplicarCriterio]);



    useEffect(() => {

        if (curso) void populaCriterio(curso);

    }, [todos, unidadeId]); // eslint-disable-line react-hooks/exhaustive-deps



    const corpo = (curriculoIdSel: number, unidadeSel: number) => ({

        unidadeId: unidadeSel,

        curriculoId: curriculoIdSel,

        mes: ocultos.mes,

        periodo: ocultos.periodo,

        qtdTurmaAbertas: ocultos.qtdTurmaAbertas,

        qtdAulasToleraciaMatricula: Number(aulasTolerancia || '0'),

        dataInicio: dataInicio || null,

        dataFim: dataFim || null,

        tipoMatricula,

    });



    const validar = (): string => {

        if (!curso) return 'Selecione um curso.';

        if (!todos && !unidadeId) return 'Selecione uma unidade.';

        if (dataInicio && dataFim && dataInicio > dataFim) {

            return 'A data de início não pode ser posterior à data de fim.';

        }

        return '';

    };



    const voltar = () => navigate(outcomeLista);



    const salvar = async (continuar?: boolean) => {

        const erroValidacao = validar();

        if (erroValidacao) {

            alert(erroValidacao);

            return;

        }

        setSalvando(true);

        setMensagem('');

        try {

            if (todos) {

                // Modo "Todos" do legado: replica o critério apenas para unidades sem critério criado

                let criados = 0;

                let existentes = 0;

                for (const unidade of unidades) {

                    const {data: ids} = await api.get<number[]>('/api/educacao/criterio/buscar-criterio', {

                        params: {curriculoId: curso!.id, unidadeId: unidade.id},

                    });

                    if (Array.isArray(ids) && ids.length > 0) {

                        existentes += 1;

                        continue;

                    }

                    await api.post('/api/educacao/criterio', corpo(curso!.id, unidade.id));

                    criados += 1;

                }

                alert(`Critério replicado: ${criados} criado(s), ${existentes} já existente(s).`);

                if (!continuar) voltar();

            } else {

                const body = corpo(curso!.id, unidadeId!);

                const gravado = criterioId

                    ? await api.put(`/api/educacao/criterio/${criterioId}`, body)

                    : await api.post('/api/educacao/criterio', body);

                alert('Registro salvo com sucesso.');

                if (continuar) {

                    const novoId = (gravado as any)?.data?.id;

                    if (!criterioId && novoId) setCriterioId(novoId);

                } else {

                    voltar();

                }

            }

        } catch (erro) {

            alert(`Erro ao salvar o critério: ${apiErrorMessage(erro)}`);

        } finally {

            setSalvando(false);

        }

    };



    const podeSalvar = can(criterioId ? 'UPDATE' : 'CREATE', outcomeLista);



    if (carregando) {

        return (

            <PermissionGate permission="READ" module={outcomeLista}>

                <main>

                    <h1>Critérios de Curso</h1>

                    <div className="div_form">

                        <p className="master-detail-empty">Carregando...</p>

                    </div>

                </main>

            </PermissionGate>

        );

    }



    return (

        <PermissionGate permission="READ" module={outcomeLista}>

            <main>

                <h1>{criterioId ? `Editar Critério #${criterioId}` : 'Critérios de Curso'}</h1>

                <div className="div_form">

                    <div className="form-title">{criterioId ? `Critério #${criterioId}` : 'Novo Critério'}</div>

                    <div className="table_form">

                        <div className="form-grid">

                            <label className="form-field">

                                <span className="form-label">Unidade *</span>

                                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>

                                    <select

                                        className="form-input form-select"

                                        style={{width: '120px'}}

                                        value={todos ? 'todos' : 'escolha'}

                                        title="Quando for todos, replica para as unidades que ainda não possuem critério"

                                        onChange={(event) => setTodos(event.target.value === 'todos')}

                                    >

                                        <option value="escolha">Escolha</option>

                                        <option value="todos">Todas</option>

                                    </select>

                                    {!todos && (

                                        <select

                                            className="form-input form-select"

                                            value={unidadeId ?? ''}

                                            onChange={(event) => setUnidadeId(event.target.value ? Number(event.target.value) : null)}

                                        >

                                            <option value="">-- Selecione --</option>

                                            {[...unidades]

                                                .sort((a, b) => unidadeLabel(a).localeCompare(unidadeLabel(b)))

                                                .map(unidade => (

                                                    <option key={unidade.id} value={unidade.id}>

                                                        {unidadeLabel(unidade)}

                                                    </option>

                                                ))}

                                        </select>

                                    )}

                                </div>

                            </label>

                            <label className="form-field">

                                <span className="form-label">Curso *</span>

                                <AutoComplete

                                    placeholder="Digite para buscar (mínimo 3 caracteres)"

                                    value={curso}

                                    onChange={(opcao) => {

                                        setCurso(opcao);

                                        if (opcao) void populaCriterio(opcao);

                                    }}

                                    fetchOptions={buscarCursos}

                                />

                            </label>

                            <label className="form-field">

                                <span className="form-label">Tipo Matrícula</span>

                                <select

                                    className="form-input form-select"

                                    value={tipoMatricula}

                                    onChange={(event) => setTipoMatricula(event.target.value)}

                                >

                                    {TIPOS_MATRICULA.map(tipo => (

                                        <option key={tipo} value={tipo}>{tipo}</option>

                                    ))}

                                </select>

                            </label>

                            <label className="form-field">

                                <span className="form-label"

                                      title="Quantidade de aulas de tolerância para fazer a matrícula">

                                    Aulas Tolerância Matrícula

                                </span>

                                <input

                                    className="form-input"

                                    style={{width: '100px'}}

                                    inputMode="numeric"

                                    value={aulasTolerancia}

                                    onChange={(event) => setAulasTolerancia(soNumeros(event.target.value))}

                                />

                            </label>

                            <label className="form-field">

                                <span className="form-label">Data Início Aula</span>

                                <input

                                    type="date"

                                    className="form-input"

                                    value={dataInicio}

                                    onChange={(event) => setDataInicio(event.target.value)}

                                />

                            </label>

                            <label className="form-field">

                                <span className="form-label">Data Fim Aula</span>

                                <input

                                    type="date"

                                    className="form-input"

                                    value={dataFim}

                                    onChange={(event) => setDataFim(event.target.value)}

                                />

                            </label>

                        </div>

                        {mensagem && <p className="form-empty">{mensagem}</p>}

                        <div className="form-buttons">

                            {podeSalvar && (

                                <button type="button" className="btnblue" title="Salvar registro"

                                        disabled={salvando} onClick={() => void salvar(false)}>

                                    Salvar

                                </button>

                            )}

                            {podeSalvar && (

                                <button type="button" className="btnstop" title="Salvar e continuar editando"

                                        disabled={salvando} onClick={() => void salvar(true)}>

                                    Salvar e Continuar

                                </button>

                            )}

                            <button type="button" className="btnyellow" title="Voltar para a lista"

                                    onClick={voltar} disabled={salvando}>

                                Voltar

                            </button>

                        </div>

                    </div>

                </div>

            </main>

        </PermissionGate>

    );

}

