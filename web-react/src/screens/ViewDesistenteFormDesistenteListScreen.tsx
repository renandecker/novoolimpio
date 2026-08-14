import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';

// formDesistente.xhtml (olimpio.zip) is a plain single-panel form (po:cabecalho + po:formButtons),
// it does not use p:wizard — so no wizard/steps should be added here.
export default function ViewDesistenteFormDesistenteListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Form Desistente</h1>
        <div className="div_form">
          <div className="form-title">Desistente</div>
          <div className="table_form">
            <DataTable path="/api/view/desistente/formDesistente" />
          </div>
        </div>
      </main>
    </PermissionGate>
  );
}
