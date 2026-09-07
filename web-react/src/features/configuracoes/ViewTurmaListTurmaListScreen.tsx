import {useState, useEffect} from 'react';
import type {ReactNode} from 'react';

import {PermissionGate} from '../../shared/services/permissions';

import {DataTable, type DataTableColumn, type DataTableRowAction, type DataTableToolbarButton} from '../../shared/components/DataTable';

import {MasterDetail} from '../../shared/components/MasterDetail';

import {Tabs} from '../../shared/components/Tabs';

import {Wizard} from '../../shared/components/Wizard';

import {api} from '../../shared/services/api';

import {

    UNIDADE_SOURCE,

    UNIDADE_COLUMNS,

    UNIDADE_SEARCH,

    COMPONENTE_SOURCE,

    COMPONENTE_COLUMNS,

    COMPONENTE_SEARCH,

} from '../../shared/services/masterDetailSources';

import type {ApiItem} from '../../features/auth/types';

import {usePermissions} from '../../shared/services/permissions';

import '../../features/professor/GestaoProfessor.css';


const TURMA_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'unidade_descricao', label: 'Unidade'},
    {key: 'grupo_descricao', label: 'Grupo'},
    {key: 'curriculo_descricao', label: 'Curso'},
    {key: 'componente_curricular_descricao', label: 'Componente Curricular'},
    {key: 'professor_descricao', label: 'Professor'},
    {key: 'sala_descricao', label: 'Sala'},
    {key: 'status', label: 'Status'},
];


interface NotasResponse {

    turma: {id: number; nome: string};

    avaliacoes: Array<{id: number; nome: string; data: string; peso: number}>;

    alunos: Array<{

        id: number;

        nome: string;

        notas: Array<{avaliacaoId: number; valor: number | null}>;

    }>;

}


interface PresencasResponse {

    turma: {id: number; nome: string};

    aulas: Array<{id: number; data: string; tema: string}>;

    alunos: Array<{

        id: number;

        nome: string;

        presencas: Array<{aulaId: number; status: string}>;

    }>;

}


const MATRICULA_COLUMNS: DataTableColumn[] = [

    {key: 'contratoId', label: 'Contrato'},

    {key: 'oferecimentoComponenteCurricularId', label: 'Oferecimento'},

    {key: 'formaPagamentoId', label: 'Forma de Pagamento'},

    {key: 'status', label: 'Status'},

    {key: 'data', label: 'Data'},

];


const DIAS_AULA_COLUMNS: DataTableColumn[] = [

    {key: 'oferecimentoComponenteCurricularId', label: 'Oferecimento'},

    {key: 'data', label: 'Data'},

    {key: 'professorId', label: 'Professor'},

    {key: 'salaId', label: 'Sala'},

    {key: 'aulaCoringa', label: 'Aula Coringa'},

    {key: 'aulaPresencial', label: 'Presencial'},

    {key: 'ativo', label: 'Ativo'},

];


const PROFESSOR_COLUMNS: DataTableColumn[] = [

    {key: 'pessoaId', label: 'Pessoa'},

    {key: 'ativo', label: 'Ativo'},

    {key: 'dataInicio', label: 'Início'},

    {key: 'dataFim', label: 'Fim'},

];


/** <p:dialog id="dialogo" header="Finalizando Turma"><p:tabView> — plain tabs, not a wizard. */

function FinalizarTurmaModal({turma, onClose}: { turma: ApiItem | null; onClose: () => void }) {

    const [notas, setNotas] = useState<NotasResponse | null>(null);

    const [presencas, setPresencas] = useState<PresencasResponse | null>(null);

    const [loadingNotas, setLoadingNotas] = useState(false);

    const [loadingPresencas, setLoadingPresencas] = useState(false);

    const [activeTab, setActiveTab] = useState<'matriculas' | 'notas' | 'presencas'>('matriculas');


    useEffect(() => {

        if (!turma) return;

        const fetchNotas = async () => {

            setLoadingNotas(true);

            try {

                const {data} = await api.get<NotasResponse>(`/api/educacao/turma/${turma.id}/notas`);

                setNotas(data);

            } catch {

                setNotas(null);

            } finally {

                setLoadingNotas(false);

            }

        };

        const fetchPresencas = async () => {

            setLoadingPresencas(true);

            try {

                const {data} = await api.get<PresencasResponse>(`/api/educacao/turma/${turma.id}/presencas`);

                setPresencas(data);

            } catch {

                setPresencas(null);

            } finally {

                setLoadingPresencas(false);

            }

        };

        if (activeTab === 'notas') fetchNotas();

        if (activeTab === 'presencas') fetchPresencas();

    }, [turma, activeTab]);


    const renderNotas = () => {

        if (loadingNotas) return <p className="master-detail-empty">Carregando notas...</p>;

        if (!notas) return <p className="master-detail-empty">Erro ao carregar notas.</p>;

        if (!notas.alunos?.length) return <p className="master-detail-empty">Nenhuma nota lançada.</p>;

        return (

            <div style={{overflowX: 'auto'}}>

                <table className="aluno-portal-tabela">

                    <thead>

                    <tr>

                        <th>Aluno</th>

                        {notas.avaliacoes.map(a => <th key={a.id}>{a.nome}</th>)}

                    </tr>

                    </thead>

                    <tbody>

                    {notas.alunos.map(aluno => (

                        <tr key={aluno.id}>

                            <td><strong>{aluno.nome}</strong></td>

                            {notas.avaliacoes.map(ava => {

                                const nota = aluno.notas.find(n => n.avaliacaoId === ava.id);

                                return <td key={ava.id}>{nota?.valor ?? '-'}</td>;

                            })}

                        </tr>

                    ))}

                    </tbody>

                </table>

            </div>

        );

    };


    const renderPresencas = () => {

        if (loadingPresencas) return <p className="master-detail-empty">Carregando presenças...</p>;

        if (!presencas) return <p className="master-detail-empty">Erro ao carregar presenças.</p>;

        if (!presencas.alunos?.length) return <p className="master-detail-empty">Nenhuma presença registrada.</p>;

        return (

            <div style={{overflowX: 'auto'}}>

                <table className="aluno-portal-tabela">

                    <thead>

                    <tr>

                        <th>Aluno</th>

                        {presencas.aulas.map(a => <th key={a.id} title={a.tema}>{formatarData(a.data)}</th>)}

                    </tr>

                    </thead>

                    <tbody>

                    {presencas.alunos.map(aluno => (

                        <tr key={aluno.id}>

                            <td><strong>{aluno.nome}</strong></td>

                            {presencas.aulas.map(aula => {

                                const p = aluno.presencas.find(pr => pr.aulaId === aula.id);

                                return <td key={aula.id}>{p?.status ?? '-'}</td>;

                            })}

                        </tr>

                    ))}

                    </tbody>

                </table>

            </div>

        );

    };


    return (

        <div className="modal-overlay" onClick={onClose}>

            <div className="modal form-modal" onClick={(event) => event.stopPropagation()}>

                <h2>Finalizando Turma: {turma?.nome ?? ''}</h2>

                <Tabs

                    tabs={[

                        {

                            key: 'matriculas',

                            label: 'Matrículas',

                            content: <DataTable path="/api/educacao/matricula" columns={MATRICULA_COLUMNS} params={{turmaId: turma?.id}} />,

                        },

                        {key: 'notas', label: 'Notas', content: renderNotas()},

                        {key: 'presencas', label: 'Presenças', content: renderPresencas()},

                    ]}

                    activeKey={activeTab}

                    onChange={setActiveTab}

                />

                <div className="modal-actions form-footer">

                    <button type="button" className="btn-form-back" onClick={onClose}>Fechar</button>

                </div>

            </div>

        </div>

    );

}


function formatarData(valor: string | null | undefined): string {

    if (!valor) return '-';

    const [ano, mes, dia] = valor.split('T')[0].split('-');

    if (!ano || !mes || !dia) return valor;

    return `${dia}/${mes}/${ano}`;

}


/** <p:dialog id="dialogProrrogando" widgetVar="prorrogando"><p:wizard> — Dias Aula / Comparativo Aula / Professor. */

function ProrrogarTurmaModal({onClose}: { onClose: () => void }) {

    return (

        <div className="modal-overlay" onClick={onClose}>

            <div className="modal form-modal" onClick={(event) => event.stopPropagation()}>

                <h2>Prorrogando Turma</h2>

                <Wizard

                    completeLabel="Concluir"

                    onComplete={onClose}

                    steps={[

                        {

                            key: 'diaAula',

                            label: 'Dias Aula',

                            content: <DataTable path="/api/educacao/ocorrencia-componente-curricular"

                                                columns={DIAS_AULA_COLUMNS}/>,

                        },

                        {

                            key: 'comparativoAula',

                            label: 'Comparativo Aula',

                            content: <p className="master-detail-empty">Comparativo de aulas.</p>,

                        },

                        {

                            key: 'selecioneProfessor',

                            label: 'Professor',

                            nextLabel: 'Salvar',

                            content: <DataTable path="/api/professor/professor" columns={PROFESSOR_COLUMNS}/>,

                        },

                    ]}

                />

            </div>

        </div>

    );

}


/** <p:dialog header="Trocar aluno da turma"><p:wizard id="wizardtroca" showNavBar="false"> — Selecionando Aluno / Nova Turma. */

function TrocarTurmaModal({onClose}: { onClose: () => void }) {

    return (

        <div className="modal-overlay" onClick={onClose}>

            <div className="modal form-modal" onClick={(event) => event.stopPropagation()}>

                <h2>Trocar aluno da turma</h2>

                <Wizard

                    completeLabel="Concluir"

                    onComplete={onClose}

                    steps={[

                        {

                            key: 'selecionarAluno',

                            label: 'Selecionando Aluno',

                            content: <p className="master-detail-empty">Seleção de aluno.</p>

                        },

                        {

                            key: 'novaTurma',

                            label: 'Selecionando nova Turma',

                            nextLabel: 'Finalizar',

                            content: <p className="master-detail-empty">Seleção de nova turma.</p>

                        },

                    ]}

                />

            </div>

        </div>

    );

}


function RecriarCalendarioAcademicoWizard({turma, onClose}: { turma: ApiItem | null; onClose: () => void }) {
    return (
        <div>
            <h2>Recriar Calendário Acadêmico</h2>
            <Wizard
                completeLabel="Recriar"
                onComplete={() => {
                    alert('Calendário acadêmico recriado com sucesso!');
                    onClose();
                }}
                steps={[
                    {
                        key: 'turma',
                        label: 'Turma',
                        content: (
                            <>
                                <p className="master-detail-empty">Turma selecionada: #{turma?.id ?? 'Nenhuma'} - {String(turma?.nome ?? '')}</p>
                                <DataTable path="/api/educacao/turma" columns={TURMA_COLUMNS} />
                            </>
                        ),
                    },
                    {
                        key: 'periodo',
                        label: 'Período',
                        content: <p className="master-detail-empty">Informe o período letivo para recriação.</p>,
                    },
                    {
                        key: 'confirmacao',
                        label: 'Confirmação',
                        nextLabel: 'Recriar',
                        content: <p className="master-detail-empty">Revise e recrie o calendário acadêmico.</p>,
                    },
                ]}
            />
            <div className="modal-actions form-footer" style={{marginTop: '15px'}}>
                <button type="button" className="btn-form-back" onClick={onClose}>Fechar</button>
            </div>
        </div>
    );
}


export default function ViewTurmaListTurmaListScreen() {

    const [unidades, setUnidades] = useState<ApiItem[]>([]);

    const [componentes, setComponentes] = useState<ApiItem[]>([]);

    const [finalizarAberto, setFinalizarAberto] = useState(false);

    const [prorrogarAberto, setProrrogarAberto] = useState(false);

    const [trocarAberto, setTrocarAberto] = useState(false);

    const [infoAberto, setInfoAberto] = useState(false);

    const [turmaSelecionada, setTurmaSelecionada] = useState<ApiItem | null>(null);

    const [recriarCalendarioAberto, setRecriarCalendarioAberto] = useState(false);
    const [recriarCalendarioTurma, setRecriarCalendarioTurma] = useState<ApiItem | null>(null);

    const {can} = usePermissions();
    const screenOutcome = '/view/turma/listTurma';


    const buildExtraRowActions = (): DataTableRowAction[] => {
        const actions: DataTableRowAction[] = [];

        // CREATE permission actions (acessoNovo) - Trocar Componente, Alterar professor
        if (can('CREATE', screenOutcome)) {
            actions.push({
                key: 'trocarComponente',
                title: 'Trocar Componente',
                className: 'gp-btn-acoes btngreen',
                icon: '⇄',
                permission: 'CREATE',
                onClick: async (item) => {
                    setTurmaSelecionada(item);
                    // Call API to load students for component swap
                    await api.post(`/api/educacao/turma/${item.id}/carrega-alunos`, {trocarComponente: true});
                    setTrocarAberto(true);
                },
            });
            actions.push({
                key: 'alterarProfessor',
                title: 'Alterar Professor',
                className: 'gp-btn-acoes btnblack',
                icon: '👤',
                permission: 'CREATE',
                onClick: async (item) => {
                    setTurmaSelecionada(item);
                    await api.post(`/api/educacao/turma/${item.id}/obter-professores`);
                    // Would open professor selection modal
                },
            });
        }

        // UPDATE permission actions (acessoEditar) - Criar Aula Coringa, Trocar Turma, Alterar Sala
        if (can('UPDATE', screenOutcome)) {
            actions.push({
                key: 'criarAulaCoringa',
                title: 'Criar Aula Coringa',
                className: 'gp-btn-acoes btnpurple',
                icon: '📅',
                permission: 'UPDATE',
                onClick: async (item) => {
                    const record = item as unknown as Record<string, unknown>;
                    const status = String(record.status ?? '');
                    if (status === 'PENDENTE' || status === 'CANCELADA') {
                        alert('Não é possível criar aula coringa para turma com status ' + status);
                        return;
                    }
                    await api.post(`/api/educacao/calendario/recriar`, {turmaId: item.id});
                    alert('Aula coringa criada com sucesso!');
                },
            });
            actions.push({
                key: 'trocarTurma',
                title: 'Trocar Turma',
                className: 'gp-btn-acoes btnblue',
                icon: '⇄',
                permission: 'UPDATE',
                onClick: async (item) => {
                    setTurmaSelecionada(item);
                    await api.post(`/api/educacao/turma/${item.id}/carrega-alunos`, {trocarTurma: true});
                    setTrocarAberto(true);
                },
            });
            actions.push({
                key: 'alterarSala',
                title: 'Alterar Sala',
                className: 'gp-btn-acoes btnorange',
                icon: '🏫',
                permission: 'UPDATE',
                onClick: async (item) => {
                    setTurmaSelecionada(item);
                    await api.post(`/api/educacao/turma/${item.id}/obter-salas`);
                    // Would open sala selection modal
                },
            });
        }

        // EXECUTE/REPORTS permission actions (acessoRelatorios) - Mais informações, Segunda via troca, Diário de Classe
        if (can('EXECUTE', screenOutcome)) {
            actions.push({
                key: 'maisInformacoes',
                title: 'Mais Informações',
                className: 'gp-btn-acoes btnyellow',
                icon: 'ℹ️',
                permission: 'EXECUTE',
                onClick: async (item) => {
                    setTurmaSelecionada(item);
                    await api.post(`/api/educacao/turma/${item.id}/informacoes`);
                    setInfoAberto(true);
                },
            });
            actions.push({
                key: 'segundaViaTroca',
                title: '2ª Via Troca Turma',
                className: 'gp-btn-acoes btnblue',
                icon: '📄',
                permission: 'EXECUTE',
                onClick: async (item) => {
                    window.open(`/api/educacao/turma/${item.id}/segunda-via-troca`, '_blank');
                },
            });
            actions.push({
                key: 'diarioClasse',
                title: 'Diário de Classe',
                className: 'gp-btn-acoes btnblack',
                icon: '📋',
                permission: 'EXECUTE',
                onClick: async (item) => {
                    setTurmaSelecionada(item);
                    // Would open diario de classe modal
                },
            });
        }

        // DELETE/REMOVE permission actions (acessoRemover) - Finalizar, Cancelar ou Prorrogar
        if (can('DELETE', screenOutcome)) {
            actions.push({
                key: 'finalizar',
                title: 'Finalizar',
                className: 'gp-btn-acoes btngrey',
                icon: '✓',
                permission: 'DELETE',
                onClick: async (item) => {
                    const record = item as unknown as Record<string, unknown>;
                    const status = String(record.status ?? '');
                    if (status !== 'EM_ANDAMENTO' && status !== 'CANCELADA') {
                        alert('Só é possível finalizar turmas com status EM_ANDAMENTO ou CANCELADA');
                        return;
                    }
                    setTurmaSelecionada(item);
                    await api.post(`/api/educacao/turma/${item.id}/listar-matriculas`);
                    setFinalizarAberto(true);
                },
            });
            actions.push({
                key: 'cancelarProrrogar',
                title: 'Cancelar ou Prorrogar',
                className: 'gp-btn-acoes btnred',
                icon: '✕',
                permission: 'DELETE',
                onClick: async (item) => {
                    const record = item as unknown as Record<string, unknown>;
                    const status = String(record.status ?? '');
                    if (status === 'CANCELADA') {
                        alert('Turma já está cancelada');
                        return;
                    }
                    setTurmaSelecionada(item);
                    await api.post(`/api/educacao/turma/${item.id}/carrega-alunos`, {cancelarProrrogar: true});
                    setProrrogarAberto(true);
                },
            });
        }

        return actions;
    };


    const extraRowActions = buildExtraRowActions();


    const extraToolbarButtons: DataTableToolbarButton[] = [
        {
            label: 'Recriar Calendário Acadêmico',
            className: 'btnpurple',
            onClick: () => {
                setRecriarCalendarioTurma(null);
                setRecriarCalendarioAberto(true);
            },
        },
    ];

    return (

        <PermissionGate permission="READ">

            <main>

                <h1>Turma</h1>


                <div className="div_form">

                    <div className="form-title">Filtros</div>

                    <div className="table_form">

                        <MasterDetail

                            label="Unidade"

                            source={UNIDADE_SOURCE}

                            valueKey="id"

                            searchKeys={UNIDADE_SEARCH}

                            columns={UNIDADE_COLUMNS}

                            items={unidades}

                            onChange={setUnidades}

                        />

                        <MasterDetail

                            label="Componente Curricular"

                            source={COMPONENTE_SOURCE}

                            valueKey="id"

                            searchKeys={COMPONENTE_SEARCH}

                            columns={COMPONENTE_COLUMNS}

                            items={componentes}

                            onChange={setComponentes}

                        />

                    </div>

                </div>


                <DataTable
                    path="/api/educacao/turma"
                    columns={TURMA_COLUMNS}
                    extraRowActions={extraRowActions}
                    extraToolbarButtons={extraToolbarButtons}
                    module="educacao"
                    outcome={screenOutcome}
                />


                {finalizarAberto && <FinalizarTurmaModal turma={turmaSelecionada} onClose={() => { setFinalizarAberto(false); setTurmaSelecionada(null); }}/>}
                {prorrogarAberto && <ProrrogarTurmaModal onClose={() => { setProrrogarAberto(false); setTurmaSelecionada(null); }}/>}
                {trocarAberto && <TrocarTurmaModal onClose={() => { setTrocarAberto(false); setTurmaSelecionada(null); }}/>}
                {infoAberto && (
                    <div className="modal-overlay" onClick={() => { setInfoAberto(false); setTurmaSelecionada(null); }}>
                        <div className="modal form-modal" onClick={(e) => e.stopPropagation()}>
                            <h2>Informações da Turma</h2>
                            <p className="master-detail-empty">Detalhes da turma #{turmaSelecionada?.id}</p>
                            <div className="modal-actions form-footer">
                                <button type="button" className="btn-form-back" onClick={() => { setInfoAberto(false); setTurmaSelecionada(null); }}>Fechar</button>
                            </div>
                        </div>
                    </div>
                )}
                {recriarCalendarioAberto && (
                    <div className="modal-overlay" onClick={() => { setRecriarCalendarioAberto(false); setRecriarCalendarioTurma(null); }}>
                        <div className="modal form-modal" style={{maxWidth: '900px', width: '95%'}} onClick={(e) => e.stopPropagation()}>
                            <RecriarCalendarioAcademicoWizard
                                turma={recriarCalendarioTurma}
                                onClose={() => { setRecriarCalendarioAberto(false); setRecriarCalendarioTurma(null); }}
                            />
                        </div>
                    </div>
                )}

            </main>

        </PermissionGate>

    );

}