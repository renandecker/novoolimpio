import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewCategoriaCampoListCategoriaCampoListScreen() {
    return <PermissionGate permission="READ">
        <main>
            <h1>Categoria do Campo</h1>
            <DataTable 
                path="/api/view/categoriaCampo/listCategoriaCampo" 
                columns={[
                    {key: 'id', label: 'ID'},
                    {key: 'descricao', label: 'Descrição'}
                ]}
            />
        </main>
    </PermissionGate>
}
