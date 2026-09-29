import {PermissionGate} from '../../../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../../../shared/components/DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'livroDigital.titulo', label: 'Livro Digital'},
    {key: 'modeloLicenca', label: 'Modelo'},
    {key: 'totalLicencasContratadas', label: 'Licenças Contratadas'},
    {key: 'licencasEmUso', label: 'Em Uso'},
    {key: 'licencasDisponiveis', label: 'Disponíveis'},
    {key: 'dataInicioVigencia', label: 'Início Vigência'},
    {key: 'dataFimVigencia', label: 'Fim Vigência'},
    {key: 'statusDisplay', label: 'Status'},
];

export default function ViewLicencaListLicencaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Licenças de Acervo</h1>
                <DataTable path="/api/biblioteca-virtual/licenca" module="biblioteca-virtual" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
            </main>
        </PermissionGate>
    );
}