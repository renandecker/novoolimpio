import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import { Tabs } from '../Tabs';

export default function ViewNapAbasinfoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Abasinfo</h1>
        <div className="div_form">
          <div className="form-title">NAP</div>
          <div className="table_form">
            <Tabs
              tabs={[
                { key: 'aluno', label: 'Aluno', content: <p className="master-detail-empty">Dados do aluno.</p> },
                { key: 'responsavel', label: 'Responsável', content: <p className="master-detail-empty">Dados do responsável.</p> },
                { key: 'matricula', label: 'Matrícula', content: <p className="master-detail-empty">Dados da matrícula.</p> },
                { key: 'caderno', label: 'Caderno', content: <p className="master-detail-empty">Caderno do NAP.</p> },
                { key: 'oc', label: 'Oferecimento', content: <p className="master-detail-empty">Componente curricular e status.</p> },
                { key: 'nota', label: 'Nota', content: <p className="master-detail-empty">Notas do aluno.</p> },
                { key: 'ligacao', label: 'Ligação', content: <p className="master-detail-empty">Ligações realizadas.</p> },
                { key: 'email', label: 'E-mail', content: <p className="master-detail-empty">E-mails enviados.</p> },
                { key: 'chamada', label: 'Chamada', content: <p className="master-detail-empty">Chamada de presença.</p> },
              ]}
            />
          </div>
        </div>
        <DataTable path="/api/view/nap/abasinfo" />
      </main>
    </PermissionGate>
  );
}
