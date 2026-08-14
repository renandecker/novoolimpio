import { PermissionGate } from '../permissions';
import { ModuleTabs } from '../ModuleTabs';

export default function ViewFeriadoListFeriadoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>List Feriado</h1>
        <ModuleTabs
          tabs={[
            { key: 'tabela', label: 'Tabela', path: '/api/view/feriado/listFeriado' },
            { key: 'calendario', label: 'Calendário', empty: 'Conteúdo de Calendário.' },
            { key: 'ajusteFeriadoOferecimento', label: 'Ajuste Feriado Oferecimento', empty: 'Conteúdo de Ajuste Feriado Oferecimento.' },
            { key: 'feriadoAjuste', label: 'Feriado Ajuste', empty: 'Conteúdo de Feriado Ajuste.' },
            { key: 'feriadoNaoAjustar', label: 'Feriado Não Ajustar', empty: 'Conteúdo de Feriado Não Ajustar.' },
          ]}
        />
      </main>
    </PermissionGate>
  );
}
