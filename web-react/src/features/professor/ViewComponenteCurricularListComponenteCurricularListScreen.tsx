import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';
import type {ApiItem} from '../../shared/types/index';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
    {key: 'descricao', label: 'Nome'},
    {key: 'sucinto', label: 'Sucinto'},
    {key: 'carga_horaria', label: 'Carga Horária'},
    {key: 'qtde_corringa', label: 'Nº Aula Coringa'},
    {key: 'creditos', label: 'Créditos'},
    {key: 'tipo_sala_descricao', label: 'Tipo Sala'},
];

export default function ViewComponenteCurricularListComponenteCurricularListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Componente Curricular</h1>
                <DataTable
                    path="/api/view/componenteCurricular/listComponenteCurricular"
                    columns={COLUMNS}
                    maxMainColumns={COLUMNS.length}
                    editNavigateTo="/view/componenteCurricular/formComponenteCurricular"
                    createNavigateTo="/view/componenteCurricular/formComponenteCurricular"
                />
            </main>
        </PermissionGate>
    );
}
