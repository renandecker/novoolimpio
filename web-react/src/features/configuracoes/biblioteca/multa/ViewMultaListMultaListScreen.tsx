import {PermissionGate} from '../../../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../../../shared/components/DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'usuarioId', label: 'Usuário'},
    {key: 'diasAtraso', label: 'Dias de Atraso'},
    {key: 'valorPorDia', label: 'Valor/Dia'},
    {key: 'valorTotal', label: 'Valor Total'},
    {key: 'motivo', label: 'Motivo'},
    {key: 'dataPagamento', label: 'Pago em'},
    {key: 'formaPagamento', label: 'Forma de Pagamento'},
    {key: 'statusPagamento', label: 'Status'},
];

export default function ViewMultaListMultaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Multas</h1>
                <DataTable path="/api/biblioteca-fisica/multa" module="biblioteca" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
            </main>
        </PermissionGate>
    );
}
