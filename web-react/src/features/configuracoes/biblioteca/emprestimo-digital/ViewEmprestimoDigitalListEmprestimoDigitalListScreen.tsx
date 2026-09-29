import {PermissionGate} from '../../../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../../../shared/components/DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'livroDigital.titulo', label: 'Livro Digital'},
    {key: 'usuarioId', label: 'Usuário'},
    {key: 'dataInicio', label: 'Início'},
    {key: 'dataExpiracao', label: 'Expiração'},
    {key: 'tipoAcesso', label: 'Tipo Acesso'},
    {key: 'status', label: 'Status'},
    {key: 'progressoLeitura', label: 'Progresso (%)'},
];

export default function ViewEmprestimoDigitalListEmprestimoDigitalListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Empréstimos Digitais</h1>
                <DataTable path="/api/biblioteca-virtual/emprestimo-digital" module="biblioteca-virtual" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
            </main>
        </PermissionGate>
    );
}