import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import { Wizard } from '../Wizard';

export default function ViewDesistenteFormDesistenteListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Form Desistente</h1>
        <div className="div_form">
          <div className="form-title">Desistente</div>
          <div className="table_form">
            <Wizard
              steps={[
                {
                  key: 'dados',
                  label: 'Dados',
                  content: (
                    <>
                      <p className="master-detail-empty">Informações do aluno que está desistindo.</p>
                      <DataTable path="/api/view/desistente/formDesistente" />
                    </>
                  ),
                },
                {
                  key: 'motivo',
                  label: 'Motivo',
                  content: <p className="master-detail-empty">Motivo da desistência.</p>,
                },
                {
                  key: 'confirmacao',
                  label: 'Confirmação',
                  nextLabel: 'Finalizar',
                  content: <p className="master-detail-empty">Confirme a desistência do aluno.</p>,
                },
              ]}
            />
          </div>
        </div>
      </main>
    </PermissionGate>
  );
}
