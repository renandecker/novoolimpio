import {PermissionGate} from '../../shared/services/permissions';
import {ModuleTabs} from '../../shared/components/ModuleTabs';

export default function ViewConfiguracaoFormConfiguracaoEstoqueListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Configuracao Estoque</h1>
                <ModuleTabs
                    tabs={[
                        {key: 'campos', label: 'Campos', path: '/api/view/configuracao/formConfiguracaoEstoque'},
                        {key: 'configuracoes', label: 'ConfiguraÃ§Ãµes', empty: 'ConteÃºdo de ConfiguraÃ§Ãµes.'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
