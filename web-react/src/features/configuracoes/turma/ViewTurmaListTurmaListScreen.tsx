import {useState} from 'react';

import {useNavigate} from 'react-router-dom';

import {PermissionGate} from '../../../shared/services/permissions';

import {
    DataTable,
    type DataTableColumn,
    type DataTableRowAction,
    type DataTableToolbarButton,
} from '../../../shared/components/DataTable';

import {MasterDetail} from '../../../shared/components/MasterDetail';

import {api} from '../../../shared/services/api';

import {
    UNIDADE_SOURCE,
    UNIDADE_COLUMNS,
    UNIDADE_SEARCH,
    COMPONENTE_SOURCE,
    COMPONENTE_COLUMNS,
    COMPONENTE_SEARCH,
} from '../../../shared/services/masterDetailSources';

import type {ApiItem} from '../../../shared/types/types.ts';

import {
    ProfessorModal,
    SalaModal,
    InformacoesModal,
    CancelarProrrogarModal,
    ProrrogarTurmaModal,
    TrocarTurmaModal,
    DiarioModal,
} from './ViewTurmaListTurmaModais';

import '../../professor/GestaoProfessor.css';

const asRecord = (item: ApiItem) => (item ?? {}) as Record<string, unknown>;

/* Formatação de data dd/MM/yyyy (espelha formatDate das telas de referência). */
const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const TURMA_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'Turma'},
    {key: 'unidade_descricao', label: 'Unidade'},
    {key: 'grupo_descricao', label: 'Grupo'},
    {key: 'curriculo_descricao', label: 'Curso'},
    {key: 'componente_curricular_descricao', label: 'Componente Curricular'},
    {key: 'professor_descricao', label: 'Professor'},
    {key: 'sala_descricao', label: 'Sala'},
    {key: 'status', label: 'Status'},
    {key: 'inscritos', label: 'Inscritos'},
    {key: 'vagas', label: 'Vagas'},
    {key: 'cargaHoraria', label: 'C.H.'},
    {key: 'dataInicio', label: 'Data Início', render: (item) => formatDate(asRecord(item).dataInicio)},
    {key: 'dataFim', label: 'Data Fim', render: (item) => formatDate(asRecord(item).dataFim)},
];

function statusOf(item: ApiItem): string {
    return String(asRecord(item).status ?? '');
}

export default function ViewTurmaListTurmaListScreen() {
    const navigate = useNavigate();
    const screenOutcome = '/view/turma/listTurma';

    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [componentes, setComponentes] = useState<ApiItem[]>([]);

    const [turmaSelecionada, setTurmaSelecionada] = useState<ApiItem | null>(null);

    const [professorAberto, setProfessorAberto] = useState(false);
    const [salaAberto, setSalaAberto] = useState(false);
    const [infoAberto, setInfoAberto] = useState(false);
    const [cancelarProrrogarAberto, setCancelarProrrogarAberto] = useState(false);
    const [prorrogarAberto, setProrrogarAberto] = useState(false);
    const [trocarAberto, setTrocarAberto] = useState(false);
    const [diarioAberto, setDiarioAberto] = useState(false);

    const fechar = (setter: (v: boolean) => void) => () => {
        setter(false);
        setTurmaSelecionada(null);
    };

    /**
     * Lista de botões de regra de negócio por linha da tabela, espelhando os
     * 10 <p:menuitem> dos 4 <p:menuButton> do listTurma.xhtml
     * (acessoNovo | acessoEditar | acessoRelatorios | acessoRemover).
     * Cada botão mantém permission, styleClass/cor, disabled e ação do XHTML.
     */
    const buildExtraRowActions = (): DataTableRowAction[] => [
        {
            key: 'trocarComponente',
            title: 'Trocar Componente',
            className: 'btngreen',
            icon: '⇄',
            permission: 'CREATE',
            onClick: async (item) => {
                setTurmaSelecionada(item);
                await api.post(`/api/educacao/turma/${item.id}/carrega-alunos`, {trocarComponente: true});
                setTrocarAberto(true);
            },
        },
        {
            key: 'alterarProfessor',
            title: 'Alterar professor',
            className: 'btnblack',
            icon: '👤',
            permission: 'CREATE',
            onClick: async (item) => {
                setTurmaSelecionada(item);
                await api.post(`/api/educacao/turma/${item.id}/obter-professores`);
                window.dispatchEvent(new CustomEvent('turma:professores', {detail: item}));
                setProfessorAberto(true);
            },
        },
        {
            key: 'criarAulaCoringa',
            title: 'Criar Aula coringa',
            className: 'btnpurple',
            icon: '📅',
            permission: 'UPDATE',
            visible: (item) => statusOf(item) !== 'PENDENTE' && statusOf(item) !== 'CANCELADA',
            onClick: async (item) => {
                await api.post(`/api/educacao/calendario/recriar`, {turmaId: item.id});
                alert('Aula coringa criada com sucesso!');
            },
        },
        {
            key: 'trocarTurma',
            title: 'Trocar Turma',
            className: 'btnblue',
            icon: '🔀',
            permission: 'UPDATE',
            onClick: async (item) => {
                setTurmaSelecionada(item);
                await api.post(`/api/educacao/turma/${item.id}/carrega-alunos`, {trocarTurma: true});
                setTrocarAberto(true);
            },
        },
        {
            key: 'alterarSala',
            title: 'Alterar sala',
            className: 'btnorange',
            icon: '🏫',
            permission: 'UPDATE',
            onClick: async (item) => {
                setTurmaSelecionada(item);
                await api.post(`/api/educacao/turma/${item.id}/obter-salas`);
                setSalaAberto(true);
            },
        },
        {
            key: 'maisInformacoes',
            title: 'Mais informações',
            className: 'btnyellow',
            icon: 'ℹ',
            permission: 'EXECUTE',
            onClick: async (item) => {
                setTurmaSelecionada(item);
                await api.post(`/api/educacao/turma/${item.id}/informacoes`);
                setInfoAberto(true);
            },
        },
        {
            key: 'trocaTurmaSegundaVia',
            title: 'Troca Turma (2ª via)',
            className: 'btnblue',
            icon: '🖨',
            permission: 'EXECUTE',
            onClick: (item) => {
                window.open(`/api/educacao/turma/${item.id}/segunda-via-troca`, '_blank');
            },
        },
        {
            key: 'diarioClasse',
            title: 'Diário de Classe',
            className: 'btnblack',
            icon: '📓',
            permission: 'EXECUTE',
            onClick: async (item) => {
                setTurmaSelecionada(item);
                setDiarioAberto(true);
            },
        },
        {
            key: 'finalizar',
            title: 'Finalizar',
            className: 'btngrey',
            icon: '✔',
            permission: 'DELETE',
            visible: (item) => statusOf(item) === 'EM_ANDAMENTO' || statusOf(item) === 'CANCELADA',
            onClick: async (item) => {
                await api.post(`/api/educacao/turma/${item.id}/listar-matriculas`);
                navigate(`/view/turma/listTurmaFinalizando?id=${item.id}`);
            },
        },
        {
            key: 'cancelarProrrogar',
            title: 'Cancelar ou Prorrogar',
            className: 'btnred',
            icon: '✖',
            permission: 'DELETE',
            visible: (item) => statusOf(item) !== 'CANCELADA',
            onClick: async (item) => {
                setTurmaSelecionada(item);
                await api.post(`/api/educacao/turma/${item.id}/carrega-alunos`, {cancelarProrrogar: true});
                setCancelarProrrogarAberto(true);
            },
        },
    ];

    const extraRowActions = buildExtraRowActions();

    const extraToolbarButtons: DataTableToolbarButton[] = [
        {
            label: 'Finalizar Turmas',
            className: 'btnpurple',
            title: 'Abrir tela de finalização de turmas',
            onClick: () => navigate('/view/turma/listTurmaFinalizando'),
        },
    ];

    return (
        <PermissionGate permission="READ">
            <main>
                <div className="div_form">
                    <div className="form-title">Turma</div>
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

                        <DataTable
                            path="/api/educacao/turma"
                            columns={TURMA_COLUMNS}
                            extraRowActions={extraRowActions}
                            extraToolbarButtons={extraToolbarButtons}
                            module="educacao"
                            outcome={screenOutcome}
                            hideCreate
                            hideUpdate
                            hideDelete
                            hideView
                        />
                    </div>
                </div>

                {professorAberto && <ProfessorModal turma={turmaSelecionada} onClose={fechar(setProfessorAberto)} />}
                {salaAberto && <SalaModal turma={turmaSelecionada} onClose={fechar(setSalaAberto)} />}
                {infoAberto && <InformacoesModal turma={turmaSelecionada} onClose={fechar(setInfoAberto)} />}
                {cancelarProrrogarAberto && (
                    <CancelarProrrogarModal
                        turma={turmaSelecionada}
                        onClose={fechar(setCancelarProrrogarAberto)}
                        onProrrogar={() => {
                            setCancelarProrrogarAberto(false);
                            setProrrogarAberto(true);
                        }}
                    />
                )}
                {prorrogarAberto && <ProrrogarTurmaModal turma={turmaSelecionada} onClose={fechar(setProrrogarAberto)} />}
                {trocarAberto && <TrocarTurmaModal turma={turmaSelecionada} onClose={fechar(setTrocarAberto)} />}
                {diarioAberto && <DiarioModal turma={turmaSelecionada} onClose={fechar(setDiarioAberto)} />}
            </main>
        </PermissionGate>
    );
}