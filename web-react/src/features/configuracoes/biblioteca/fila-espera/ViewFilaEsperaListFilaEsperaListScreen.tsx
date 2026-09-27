import {PermissionGate} from '../../../../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../../../../shared/components/DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'livroDigital.titulo', label: 'Livro Digital'},
    {key: 'usuarioId', label: 'Usuário'},
    {key: 'posicaoFila', label: 'Posição'},
    {key: 'dataSolicitacao', label: 'Solicitação'},
    {key: 'dataNotificacao', label: 'Notificação'},
    {key: 'dataLimiteResgate', label: 'Limite Resgate'},
    {key: 'status', label: 'Status'},
];

export default function ViewFilaEsperaListFilaEsperaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Fila de Espera Virtual</h1>
                <DataTable path="/api/biblioteca-virtual/fila-espera" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
            </main>
        </PermissionGate>
    );
}