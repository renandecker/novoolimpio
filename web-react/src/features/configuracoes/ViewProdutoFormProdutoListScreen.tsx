import {PermissionGate} from '../../shared/services/permissions';
import {ModuleTabs} from '../../shared/components/ModuleTabs';
import {UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH} from '../../shared/services/masterDetailSources';

export default function ViewProdutoFormProdutoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Produto</h1>
                <ModuleTabs
                    tabs={[
                        {
                            key: 'informacoesBasicas',
                            label: 'InformaÃ§Ãµes bÃ¡sicas',
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
                        {key: 'fornecedores', label: 'Fornecedores', empty: 'ConteÃºdo de Fornecedores.'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
