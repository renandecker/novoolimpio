import {useState} from 'react';

import {useNavigate} from 'react-router-dom';

import {PermissionGate} from '../../../shared/services/permissions';

import {
    DataTable,
    legacyClassName,
    type DataTableColumn,
    type DataTableRowMenu,
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

const val = (value: unknown): string => (value === null || value === undefined ? '' : String(value));

/* Espelha view/turma/colunasTurma.xhtml, incluído pelo listTurma.xhtml.
 * A primeira coluna do XHTML ("Turma", sortBy turma.id) é a coluna "Id" fixa
 * que o DataTable já renderiza, por isso não é repetida aqui. */
const TURMA_COLUMNS: DataTableColumn[] = [
    {key: 'grupo_descricao', label: 'Grupo'},
    {key: 'status', label: 'Status', render: (item) => (
        <span style={{fontWeight: 700}} className={legacyClassName(statusOf(item)) ?? undefined}>
            {statusOf(item)}
        </span>
    )},
    {key: 'inscritos', label: 'Inscritos / Vagas', render: (item) => {
        const record = asRecord(item);
        return `${val(record.inscritos)} / ${val(record.vagas)}`;
    }},
    {key: 'unidade_descricao', label: 'Unidade'},
    {key: 'curriculo_descricao', label: 'Curso'},
    {key: 'componente_curricular_descricao', label: 'Componente Curricular'},
    {key: 'cargaHoraria', label: 'C.H.', render: (item) => `${val(asRecord(item).cargaHoraria)} H/A`},
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
     * Os 4 <p:menuButton> do listTurma.xhtml, na mesma ordem das <p:column> de
     * ação da tabela: acessoNovo (btnstop) | acessoEditar (btngreen) |
     * acessoRelatorios (btnyellow) | acessoRemover (btnred).
     *
     * A permissão fica na coluna inteira (equivalente ao `rendered` da
     * <p:column>), e a regra de status vira o estado `disabled` do item — o
     * DataTable converte `visible` em `disabled` dentro dos menus, que é
     * exatamente a semântica do atributo `disabled` dos <p:menuitem>.
     */
    const extraRowMenus: DataTableRowMenu[] = [
        {
            key: 'acessoNovo',
            title: 'Novo',
            className: 'btnstop',
            icon: <i className="fa fa-plus-circle"/>,
            permission: 'CREATE',
            items: [
                {
                    key: 'trocarComponente',
                    title: 'Trocar Componente',
                    className: 'btngreen',
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
                    onClick: async (item) => {
                        setTurmaSelecionada(item);
                        await api.post(`/api/educacao/turma/${item.id}/obter-professores`);
                        window.dispatchEvent(new CustomEvent('turma:professores', {detail: item}));
                        setProfessorAberto(true);
                    },
                },
            ],
        },
        {
            key: 'acessoEditar',
            title: 'Editar',
            className: 'btngreen',
            icon: <i className="fa fa-pencil"/>,
            permission: 'UPDATE',
            items: [
                {
                    key: 'criarAulaCoringa',
                    title: 'Criar Aula coringa',
                    className: 'btnpurple',
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
                    onClick: async (item) => {
                        setTurmaSelecionada(item);
                        await api.post(`/api/educacao/turma/${item.id}/obter-salas`);
                        setSalaAberto(true);
                    },
                },
            ],
        },
        {
            key: 'acessoRelatorios',
            title: 'Relatórios',
            className: 'btnyellow',
            icon: <i className="fa fa-file-text-o"/>,
            permission: 'EXECUTE',
            items: [
                {
                    key: 'maisInformacoes',
                    title: 'Mais informações',
                    className: 'btnyellow',
                    onClick: async (item) => {
                        setTurmaSelecionada(item);
                        await api.post(`/api/educacao/turma/${item.id}/informacoes`);
                        setInfoAberto(true);
                    },
                },
                {
                    key: 'trocaTurmaSegundaVia',
                    title: 'Troca Turma',
                    className: 'btnblue',
                    onClick: (item) => {
                        window.open(`/api/educacao/turma/${item.id}/segunda-via-troca`, '_blank');
                    },
                },
                {
                    key: 'diarioClasse',
                    title: 'Diário de Classe',
                    className: 'btnblack',
                    onClick: async (item) => {
                        setTurmaSelecionada(item);
                        setDiarioAberto(true);
                    },
                },
            ],
        },
        {
            key: 'acessoRemover',
            title: 'Remover',
            className: 'btnred',
            icon: <i className="fa fa-trash"/>,
            permission: 'DELETE',
            items: [
                {
                    key: 'finalizar',
                    title: 'Finalizar',
                    className: 'btngrey',
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
                    visible: (item) => statusOf(item) !== 'CANCELADA',
                    onClick: async (item) => {
                        setTurmaSelecionada(item);
                        await api.post(`/api/educacao/turma/${item.id}/carrega-alunos`, {cancelarProrrogar: true});
                        setCancelarProrrogarAberto(true);
                    },
                },
            ],
        },
    ];

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
                            maxMainColumns={TURMA_COLUMNS.length}
                            extraRowMenus={extraRowMenus}
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