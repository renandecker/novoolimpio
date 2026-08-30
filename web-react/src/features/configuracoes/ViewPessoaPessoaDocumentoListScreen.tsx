import {PermissionGate} from '../../shared/services/permissions';
import {ModuleTabs} from '../../shared/components/ModuleTabs';

export default function ViewPessoaPessoaDocumentoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Pessoa Documento</h1>
                <ModuleTabs
                    tabs={[
                        {key: 'aluno', label: 'Aluno', path: '/api/view/pessoa/pessoaDocumento'},
                        {key: 'responsavel', label: 'ResponsÃ¡vel', empty: 'ConteÃºdo de ResponsÃ¡vel.'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
