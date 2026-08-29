import {PermissionGate} from '../permissions';
import {ModuleTabs} from '../ModuleTabs';
import {UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH} from '../masterDetailSources';

export default function ViewValorProdutoFormValorProdutoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Valor Produto</h1>
                <ModuleTabs
                    tabs={[
                        {key: 'valorProduto', label: 'Valor Produto', path: '/api/view/valorProduto/formValorProduto'},
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
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
