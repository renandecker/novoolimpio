import { BarChart2 } from 'lucide-react';
import { DataTable } from '../../shared/components/DataTable';
import { PermissionGate } from '../../shared/services/permissions';
import type { DataTableRowAction } from '../../shared/components/DataTable';
import { useNavigate } from 'react-router-dom';

export default function IndicadorGaugeListScreen() {
  const navigate = useNavigate();

  const extraRowActions: DataTableRowAction[] = [
    {
      key: 'ver',
      title: 'Visualizar',
      icon: <BarChart2 size={16} />,
      permission: 'EXECUTE',
      onClick: (item) => window.open(`/view/indicador/viewIndicadorGauge/${item.id}`, '_blank'),
    },
  ];

  return <PermissionGate permission="READ">
    <main>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 className="text-blue-600" size={24} />
            Indicadores Gauge
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Gerencie indicadores do tipo gauge (velocímetro) com consulta SQL</p>
        </div>
      </div>
      <DataTable
        path="/api/relatorios/indicador-gauge/disponiveis"
        module="relatorios"
        outcome="indicador-gauge"
        createNavigateTo="/view/indicador/formIndicadorGauge"
        editNavigateTo="/view/indicador/formIndicadorGauge"
        extraRowActions={extraRowActions}
        hideView={false}
      />
    </main>
  </PermissionGate>;
}