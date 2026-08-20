import {PermissionGate} from '../permissions';
import {ModuleTabs} from '../ModuleTabs';
import {
    AGENDA_SOURCE,
    AGENDA_COLUMNS,
    AGENDA_SEARCH,
    COMPONENTE_SOURCE,
    COMPONENTE_COLUMNS,
    COMPONENTE_SEARCH,
    CURSO_SOURCE,
    CURSO_COLUMNS,
    CURSO_SEARCH,
    GRUPO_SOURCE,
    GRUPO_COLUMNS,
    GRUPO_SEARCH,
    PERFIL_SOURCE,
    PERFIL_COLUMNS,
    PERFIL_SEARCH,
    PESSOA_SOURCE,
    PESSOA_COLUMNS,
    PESSOA_SEARCH,
    TURMA_SOURCE,
    TURMA_COLUMNS,
    TURMA_SEARCH,
    UNIDADE_SOURCE,
    UNIDADE_COLUMNS,
    UNIDADE_SEARCH,
    USUARIO_SOURCE,
    USUARIO_COLUMNS,
    USUARIO_SEARCH
} from '../masterDetailSources';

export default function ViewComunicacaoFormComunicacaoMensagemListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Comunicacao Mensagem</h1>
                <ModuleTabs
                    tabs={[
                        {key: 'geral', label: 'Geral', path: '/api/view/comunicacao/formComunicacaoMensagem'},
                        {key: 'filtros', label: 'Filtros', empty: 'Conteúdo de Filtros.'},
                        {
                            key: 'unidade',
                            label: 'Unidade',
                            masterDetail: {
                                label: 'Unidade',
                                source: UNIDADE_SOURCE,
                                valueKey: 'id',
                                searchKeys: UNIDADE_SEARCH,
                                columns: UNIDADE_COLUMNS
                            }
                        },
                        {
                            key: 'agenda',
                            label: 'Agenda',
                            masterDetail: {
                                label: 'Agenda',
                                source: AGENDA_SOURCE,
                                valueKey: 'id',
                                searchKeys: AGENDA_SEARCH,
                                columns: AGENDA_COLUMNS
                            }
                        },
                        {
                            key: 'perfil',
                            label: 'Perfil',
                            masterDetail: {
                                label: 'Perfil',
                                source: PERFIL_SOURCE,
                                valueKey: 'id',
                                searchKeys: PERFIL_SEARCH,
                                columns: PERFIL_COLUMNS
                            }
                        },
                        {
                            key: 'pessoa',
                            label: 'Pessoa',
                            masterDetail: {
                                label: 'Pessoa',
                                source: PESSOA_SOURCE,
                                valueKey: 'id',
                                searchKeys: PESSOA_SEARCH,
                                columns: PESSOA_COLUMNS
                            }
                        },
                        {
                            key: 'usuario',
                            label: 'Usuário',
                            masterDetail: {
                                label: 'Usuário',
                                source: USUARIO_SOURCE,
                                valueKey: 'id',
                                searchKeys: USUARIO_SEARCH,
                                columns: USUARIO_COLUMNS
                            }
                        },
                        {
                            key: 'turma',
                            label: 'Turma',
                            masterDetail: {
                                label: 'Turma',
                                source: TURMA_SOURCE,
                                valueKey: 'id',
                                searchKeys: TURMA_SEARCH,
                                columns: TURMA_COLUMNS
                            }
                        },
                        {
                            key: 'componente',
                            label: 'Componente',
                            masterDetail: {
                                label: 'Componente',
                                source: COMPONENTE_SOURCE,
                                valueKey: 'id',
                                searchKeys: COMPONENTE_SEARCH,
                                columns: COMPONENTE_COLUMNS
                            }
                        },
                        {
                            key: 'curso',
                            label: 'Curso',
                            masterDetail: {
                                label: 'Curso',
                                source: CURSO_SOURCE,
                                valueKey: 'id',
                                searchKeys: CURSO_SEARCH,
                                columns: CURSO_COLUMNS
                            }
                        },
                        {
                            key: 'grupo',
                            label: 'Grupo',
                            masterDetail: {
                                label: 'Grupo',
                                source: GRUPO_SOURCE,
                                valueKey: 'id',
                                searchKeys: GRUPO_SEARCH,
                                columns: GRUPO_COLUMNS
                            }
                        },
                        {key: 'anexos', label: 'Anexos', empty: 'Conteúdo de Anexos.'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
