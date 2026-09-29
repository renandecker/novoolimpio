import {PermissionGate} from '../../../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../../../shared/components/DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'obra.titulo', label: 'Obra'},
    {key: 'usuarioId', label: 'Usuário'},
    {key: 'posicaoFila', label: 'Posição'},
    {key: 'dataSolicitacao', label: 'Solicitação'},
    {key: 'dataDisponibilizacao', label: 'Disponibilização'},
    {key: 'dataLimiteRetirada', label: 'Limite Retirada'},
    {key: 'status', label: 'Status'},
];

export default function ViewReservaListReservaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Reservas</h1>
                <DataTable path="/api/biblioteca-fisica/reserva" module="biblioteca" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
            </main>
        </PermissionGate>
    );
}
