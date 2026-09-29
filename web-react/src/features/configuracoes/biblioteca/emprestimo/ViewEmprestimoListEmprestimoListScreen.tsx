import {PermissionGate} from '../../../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../../../shared/components/DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'exemplar.codigoBarras', label: 'Exemplar'},
    {key: 'exemplar.obra.titulo', label: 'Obra'},
    {key: 'usuarioId', label: 'Usuário'},
    {key: 'dataRetirada', label: 'Retirada'},
    {key: 'dataPrevistaDevolucao', label: 'Prev. Devolução'},
    {key: 'dataEfetivaDevolucao', label: 'Devolvido em'},
    {key: 'quantidadeRenovacoes', label: 'Renovações'},
    {key: 'status', label: 'Status'},
];

export default function ViewEmprestimoListEmprestimoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Empréstimos</h1>
                <DataTable path="/api/biblioteca-fisica/emprestimo" module="biblioteca" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
            </main>
        </PermissionGate>
    );
}
