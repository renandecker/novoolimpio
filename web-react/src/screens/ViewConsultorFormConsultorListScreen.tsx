import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import { Wizard } from '../Wizard';

export default function ViewConsultorFormConsultorListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Form Consultor</h1>
        <div className="div_form">
          <div className="form-title">Consultor</div>
          <div className="table_form">
            <Wizard
              steps={[
                {
                  key: 'contato',
                  label: 'Contato',
                  content: (
                    <div className="form-grid">
                      <label className="form-field">
                        <span className="form-label">Nome</span>
                        <input className="form-input" placeholder="Nome do consultor" />
                      </label>
                      <label className="form-field">
                        <span className="form-label">E-mail</span>
                        <input className="form-input" placeholder="E-mail" />
                      </label>
                      <label className="form-field">
                        <span className="form-label">Telefone</span>
                        <input className="form-input" placeholder="Telefone" />
                      </label>
                      <label className="form-field">
                        <span className="form-label">Ativo</span>
                        <input className="form-input" placeholder="Sim / Não" />
                      </label>
                    </div>
                  ),
                },
                {
                  key: 'acoes',
                  label: 'Ações',
                  nextLabel: 'Salvar',
                  content: (
                    <>
                      <p className="master-detail-empty">Ações vinculadas ao consultor.</p>
                      <DataTable path="/api/view/consultor/formConsultor" />
                    </>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </main>
    </PermissionGate>
  );
}
