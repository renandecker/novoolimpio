import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewSubCategoriaListSubCategoriaListScreen() {
    return <PermissionGate permission="READ">
        <main>
            <h1>Sub Categoria</h1>
            <DataTable
                path="/api/view/subCategoria/listSubCategoria"
                columns={[
                    {key: 'id', label: 'ID', options: {style: {width: '80px'}}},
                    {key: 'descricao', label: 'Descrição'},
                    {key: 'descricaocompleta', label: 'Descrição Completa'},
                    {key: 'tipoMovimento.descricao', label: 'Tipo Movimento'},
                ]}
            />
        </main>
    </PermissionGate>;
}
