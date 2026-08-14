import { PermissionGate } from '../permissions';
import { ModuleTabs } from '../ModuleTabs';

export default function ViewModeloCartaFormModeloCartaListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Form Modelo Carta</h1>
        <ModuleTabs
          tabs={[
            { key: 'cobranca', label: 'Cobrança', path: '/api/view/modeloCarta/formModeloCarta' },
            { key: 'nAP', label: 'NAP', empty: 'Conteúdo de NAP.' },
          ]}
        />
      </main>
    </PermissionGate>
  );
}
