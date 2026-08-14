import { PermissionGate } from '../permissions';
import { ModuleTabs } from '../ModuleTabs';

export default function ViewPessoaPessoaDocumentoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Pessoa Documento</h1>
        <ModuleTabs
          tabs={[
            { key: 'aluno', label: 'Aluno', path: '/api/view/pessoa/pessoaDocumento' },
            { key: 'responsavel', label: 'Responsável', empty: 'Conteúdo de Responsável.' },
          ]}
        />
      </main>
    </PermissionGate>
  );
}
