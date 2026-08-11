import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import { Wizard } from '../Wizard';

export default function ViewTurmaFormAjusteCalendarioListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Form Ajuste Calendario</h1>
        <div className="div_form">
          <div className="form-title">Ajuste de Calendário</div>
          <div className="table_form">
            <Wizard
              steps={[
                {
                  key: 'turma',
                  label: 'Turma',
                  content: (
                    <>
                      <p className="master-detail-empty">Selecione a turma que terá o calendário ajustado.</p>
                      <DataTable path="/api/view/turma/formAjusteCalendario" />
                    </>
                  ),
                },
                {
                  key: 'ajuste',
                  label: 'Ajuste',
                  content: <p className="master-detail-empty">Informe os ajustes de dias e horários de aula.</p>,
                },
                {
                  key: 'confirmacao',
                  label: 'Confirmação',
                  nextLabel: 'Aplicar',
                  content: <p className="master-detail-empty">Revise e aplique o ajuste de calendário.</p>,
                },
              ]}
            />
          </div>
        </div>
      </main>
    </PermissionGate>
  );
}
