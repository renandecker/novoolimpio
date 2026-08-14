import { PermissionGate } from '../permissions';
import { ModuleTabs } from '../ModuleTabs';

export default function ViewEtapasCobrancaListEtapasCobrancaListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>List Etapas Cobranca</h1>
        <ModuleTabs
          tabs={[
            { key: 'mensagem', label: 'Mensagem', path: '/api/view/etapasCobranca/listEtapasCobranca' },
            { key: 'retornos', label: 'Retornos', empty: 'Conteúdo de Retornos.' },
            { key: 'resumo', label: 'Resumo', empty: 'Conteúdo de Resumo.' },
          ]}
        />
      </main>
    </PermissionGate>
  );
}
