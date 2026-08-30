import {PermissionGate} from '../../shared/services/permissions';
import {ModuleTabs} from '../../shared/components/ModuleTabs';
import {
    PERFIL_SOURCE,
    PERFIL_COLUMNS,
    PERFIL_SEARCH,
    UNIDADE_SOURCE,
    UNIDADE_COLUMNS,
    UNIDADE_SEARCH,
    USUARIO_SOURCE,
    USUARIO_COLUMNS,
    USUARIO_SEARCH
} from '../../shared/services/masterDetailSources';

export default function ViewFiltrosFormFiltrosListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Filtros</h1>
                <ModuleTabs
                    tabs={[
                        {key: 'geral', label: 'Geral', path: '/api/view/filtros/formFiltros'},
                        {key: 'permissao', label: 'PermissÃ£o', empty: 'ConteÃºdo de PermissÃ£o.'},
                        {
                            key: 'usuario',
                            label: 'Usuario',
                            masterDetail: {
                                label: 'Usuario',
                                source: USUARIO_SOURCE,
                                valueKey: 'id',
                                searchKeys: USUARIO_SEARCH,
                                columns: USUARIO_COLUMNS
                            }
                        },
                        {
                            key: 'unidade',
                            label: 'Id_unidade',
                            masterDetail: {
                                label: 'Id_unidade',
                                source: UNIDADE_SOURCE,
                                valueKey: 'id',
                                searchKeys: UNIDADE_SEARCH,
                                columns: UNIDADE_COLUMNS
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
                        {key: 'permissao2', label: 'PermissÃ£o 2', empty: 'ConteÃºdo de PermissÃ£o 2.'},
                        {key: 'tabela', label: 'Tabela', empty: 'ConteÃºdo de Tabela.'},
                        {key: 'grafico', label: 'GrÃ¡fico', empty: 'ConteÃºdo de GrÃ¡fico.'},
                        {key: 'mapa', label: 'Mapa', empty: 'ConteÃºdo de Mapa.'},
                        {key: 'organograma', label: 'Organograma', empty: 'ConteÃºdo de Organograma.'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
