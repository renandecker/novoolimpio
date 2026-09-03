import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function AsaasClientesListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Clientes Asaas</h1><DataTable path="/api/asaas/clientes" module="asaas"
                                                columns={[{key: 'id', label: 'ID do Cliente Asaas'}, {
                                                    key: 'name',
                                                    label: 'Nome'
                                                }, {key: 'email', label: 'E-mail'}, {
                                                    key: 'cpfCnpj',
                                                    label: 'CPF/CNPJ'
                                                }, {key: 'phone', label: 'Telefone'}, {
                                                    key: 'cityName',
                                                    label: 'Cidade'
                                                }, {key: 'deleted', label: 'Excluído'}]}/></main>
    </PermissionGate>
}
