import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function CurriculoConfiguracaoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>ConfiguraÃ§Ã£o do CurrÃ­culo</h1>
                <DataTable
                    path="/api/curriculo/configuracao"
                    module="curriculo"
                    columns={[
                        {key: 'arquivo_curriculo', label: 'Arquivo CurrÃ­culo'},
                        {key: 'sql_variavel', label: 'SQL VariÃ¡vel'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
