import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../../shared/components/DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'nome', label: 'Nome'},
    {key: 'informacao', label: 'Informação'},
    {key: 'tipo_filtro', label: 'Tipo filtro'},
    {
        key: 'fl_exibir',
        label: 'Exibir',
        render: (item: any) => item.fl_exibir ? 'Sim' : 'Não',
    },
    {
        key: 'fl_fixo',
        label: 'Fixo',
        render: (item: any) => item.fl_fixo ? 'Sim' : 'Não',
    },
];

export default function ViewFiltrosListFiltrosListScreen() {
    return <PermissionGate permission="READ">
        <main>
            <h1>Filtros</h1>
            <DataTable
                path="/api/view/filtros/listFiltros"
                columns={COLUMNS}
                maxMainColumns={COLUMNS.length}
                editNavigateTo="/view/filtros/formFiltros"
                createNavigateTo="/view/filtros/formFiltros"
            />
        </main>
    </PermissionGate>;
}
