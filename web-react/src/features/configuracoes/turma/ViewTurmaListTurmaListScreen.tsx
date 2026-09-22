import {useState} from 'react';

import {useNavigate} from 'react-router-dom';

import {PermissionGate, usePermissions} from '../../../shared/services/permissions';

import {
    DataTable,
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

const TURMA_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID'},
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
    {key: 'dataInicio', label: 'Data Início'},
    {key: 'dataFim', label: 'Data Fim'},
];

function statusOf(item: ApiItem): string {
    return String((item as Record<string, unknown>).status ?? '');
}

export default function ViewTurmaListTurmaListScreen() {
    const navigate = useNavigate();
    const {can} = usePermissions();
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
     * Réplica dos 4 <p:menuButton> do listTurma.xhtml:
     * acessoNovo (btnstop) | acessoEditar (btngreen) | acessoRelatorios (btnyellow) | acessoRemover (btnred).
     * Cada item (<p:menuitem>) usa a cor/styleClass do XHTML.
     */
    const buildExtraRowMenus = (): DataTableRowMenu[] => {
        const menus: DataTableRowMenu[] = [];

        if (can('CREATE', screenOutcome)) {
            menus.push({
                key: 'acessoNovo',
                icon: '＋',
                className: 'btnyellow',
                title: 'Novo',
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
                            setProfessorAberto(true);
                        },
                    },
                ],
            });
        }

        if (can('UPDATE', screenOutcome)) {
            menus.push({
                key: 'acessoEditar',
                icon: '✎',
                className: 'btngreen',
                title: 'Editar',
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
            });
        }

        if (can('EXECUTE', screenOutcome)) {
            menus.push({
                key: 'acessoRelatorios',
                icon: '📄',
                className: 'btnyellow',
                title: 'Relatórios',
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
                        onClick: async (item) => {
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
            });
        }

        if (can('DELETE', screenOutcome)) {
            menus.push({
                key: 'acessoRemover',
                icon: '🗑',
                className: 'btnred',
                title: 'Remover',
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
            });
        }

        return menus;
    };

    const extraRowMenus = buildExtraRowMenus();

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
                    extraRowMenus={extraRowMenus}
                    extraToolbarButtons={extraToolbarButtons}
                    module="educacao"
                    outcome={screenOutcome}
                />

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