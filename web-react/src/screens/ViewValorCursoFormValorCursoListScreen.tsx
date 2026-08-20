import {PermissionGate} from '../permissions';
import {ModuleTabs} from '../ModuleTabs';
import {UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH} from '../masterDetailSources';

export default function ViewValorCursoFormValorCursoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Valor Curso</h1>
                <ModuleTabs
                    tabs={[
                        {key: 'valorCurso', label: 'Valor Curso', path: '/api/view/valorCurso/formValorCurso'},
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
                        {key: 'formaPagamento', label: 'Forma Pagamento', empty: 'Conteúdo de Forma Pagamento.'},
                        {key: 'ativos', label: 'Ativos', empty: 'Conteúdo de Ativos.'},
                        {key: 'todos', label: 'Todos', empty: 'Conteúdo de Todos.'},
                        {key: 'descontos', label: 'Descontos', empty: 'Conteúdo de Descontos.'},
                        {key: 'ativos2', label: 'Ativos 2', empty: 'Conteúdo de Ativos 2.'},
                        {key: 'todos2', label: 'Todos 2', empty: 'Conteúdo de Todos 2.'},
                        {key: 'taxas', label: 'Taxas', empty: 'Conteúdo de Taxas.'},
                        {key: 'ativos3', label: 'Ativos 3', empty: 'Conteúdo de Ativos 3.'},
                        {key: 'todos3', label: 'Todos 3', empty: 'Conteúdo de Todos 3.'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
