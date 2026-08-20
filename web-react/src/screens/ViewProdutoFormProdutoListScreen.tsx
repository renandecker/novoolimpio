import {PermissionGate} from '../permissions';
import {ModuleTabs} from '../ModuleTabs';
import {UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH} from '../masterDetailSources';

export default function ViewProdutoFormProdutoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Produto</h1>
                <ModuleTabs
                    tabs={[
                        {
                            key: 'informacoesBasicas',
                            label: 'Informações básicas',
                            path: '/api/view/produto/formProduto'
                        },
                        {
                            key: 'unidades',
                            label: 'Unidades',
                            masterDetail: {
                                label: 'Unidades',
                                source: UNIDADE_SOURCE,
                                valueKey: 'id',
                                searchKeys: UNIDADE_SEARCH,
                                columns: UNIDADE_COLUMNS
                            }
                        },
                        {key: 'fornecedores', label: 'Fornecedores', empty: 'Conteúdo de Fornecedores.'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
