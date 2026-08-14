import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
export default function CurriculoConfiguracaoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Configuração do Currículo</h1>
        <DataTable
          path="/api/curriculo/configuracao"
          module="curriculo"
          columns={[
            { key: 'arquivo_curriculo', label: 'Arquivo Currículo' },
            { key: 'sql_variavel', label: 'SQL Variável' },
          ]}
        />
      </main>
    </PermissionGate>
  );
}
