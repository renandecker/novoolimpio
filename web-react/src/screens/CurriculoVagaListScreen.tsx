import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
export default function CurriculoVagaListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Vagas</h1>
        <DataTable
          path="/api/curriculo/vaga"
          module="curriculo"
          columns={[
            { key: 'nome', label: 'Nome' },
            { key: 'titulo_email', label: 'Título E-mail' },
            { key: 'data_inicio', label: 'Data Início' },
            { key: 'data_fim', label: 'Data Fim' },
            { key: 'vagas', label: 'Vagas' },
            { key: 'fl_ativo', label: 'Ativo' },
            { key: 'fl_exibir_vaga', label: 'Exibir Vaga' },
            { key: 'fl_email', label: 'E-mail' },
          ]}
        />
      </main>
    </PermissionGate>
  );
}
