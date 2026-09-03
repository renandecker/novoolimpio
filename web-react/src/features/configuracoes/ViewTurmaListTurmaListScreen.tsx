import {useState, useEffect} from 'react';
import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';
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

const TURMA_COLUMNS: DataTableColumn[] = [
    {key: 'nome', label: 'Nome'},
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

/** <p:dialog id="dialogo" header="Finalizando Turma"><p:tabView> â€” plain tabs, not a wizard. */
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

/** <p:dialog id="dialogProrrogando" widgetVar="prorrogando"><p:wizard> â€” Dias Aula / Comparativo Aula / Professor. */
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

/** <p:dialog header="Trocar aluno da turma"><p:wizard id="wizardtroca" showNavBar="false"> â€” Selecionando Aluno / Nova Turma. */
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

export default function ViewTurmaListTurmaListScreen() {
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [componentes, setComponentes] = useState<ApiItem[]>([]);
    const [finalizarAberto, setFinalizarAberto] = useState(false);
    const [prorrogarAberto, setProrrogarAberto] = useState(false);
    const [trocarAberto, setTrocarAberto] = useState(false);

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

                {/* Cada botão abaixo corresponde a um <p:menuitem>/<p:dialog> independente em
            listTurma.xhtml â€” não são etapas de um único wizard de página. */}
                <div className="modal-actions" style={{margin: '0.5rem 0'}}>
                    <button type="button" className="btnblack" onClick={() => setFinalizarAberto(true)}>
                        Finalizar Turma
                    </button>
                    <button type="button" className="btnyellow" onClick={() => setProrrogarAberto(true)}>
                        Cancelar ou Prorrogar
                    </button>
                    <button type="button" className="btnsky" onClick={() => setTrocarAberto(true)}>
                        Trocar Turma
                    </button>
                </div>

                <DataTable path="/api/educacao/turma" columns={TURMA_COLUMNS}/>

                {finalizarAberto && <FinalizarTurmaModal onClose={() => setFinalizarAberto(false)}/>}
                {prorrogarAberto && <ProrrogarTurmaModal onClose={() => setProrrogarAberto(false)}/>}
                {trocarAberto && <TrocarTurmaModal onClose={() => setTrocarAberto(false)}/>}
            </main>
        </PermissionGate>
    );
}
