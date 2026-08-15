import { PermissionGate } from '../permissions';
import { ModuleTabs } from '../ModuleTabs';

export default function ViewValorCursoListValorCursoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Valor Curso</h1>
        <ModuleTabs
          tabs={[
            { key: 'formaPagamento', label: 'Forma Pagamento', path: '/api/view/valorCurso/listValorCurso' },
            { key: 'descontos', label: 'Descontos', empty: 'Conteúdo de Descontos.' },
            { key: 'taxas', label: 'Taxas', empty: 'Conteúdo de Taxas.' },
          ]}
        />
      </main>
    </PermissionGate>
  );
}
