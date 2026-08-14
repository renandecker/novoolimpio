import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';

// formConsultor.xhtml (olimpio.zip) is a single panel form (usuário + agenda + turnos de
// trabalho, all master-detail attributes) — it does not use p:wizard, so no wizard/steps here.
export default function ViewConsultorFormConsultorListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Form Consultor</h1>
        <div className="div_form">
          <div className="form-title">Consultor</div>
          <div className="table_form">
            <DataTable path="/api/view/consultor/formConsultor" />
          </div>
        </div>
      </main>
    </PermissionGate>
  );
}
