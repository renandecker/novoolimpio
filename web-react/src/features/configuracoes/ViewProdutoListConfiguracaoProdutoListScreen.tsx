import {PermissionGate} from '../permissions';
import {ModuleTabs} from '../ModuleTabs';

export default function ViewProdutoListConfiguracaoProdutoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Configuracao Produto</h1>
                <ModuleTabs
                    tabs={[
                        {key: 'campos', label: 'Campos', path: '/api/view/produto/listConfiguracaoProduto'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
