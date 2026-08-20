import {PermissionGate} from '../permissions';
import {ModuleTabs} from '../ModuleTabs';
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
} from '../masterDetailSources';

export default function ViewRelatoriosFormGraficoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Grafico</h1>
                <ModuleTabs
                    tabs={[
                        {key: 'definicao', label: 'Definição', path: '/api/view/relatorios/formGrafico'},
                        {key: 'permissao', label: 'Permissão', empty: 'Conteúdo de Permissão.'},
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
                        {key: 'filtros', label: 'Filtros', empty: 'Conteúdo de Filtros.'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
