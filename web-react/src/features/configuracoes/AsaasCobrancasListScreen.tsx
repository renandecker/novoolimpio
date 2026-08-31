import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function AsaasCobrancasListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>CobranÃ§as Asaas</h1><DataTable path="/api/asaas/cobrancas" module="asaas"
                                                 columns={[{key: 'id', label: 'ID da CobranÃ§a Asaas'}, {
                                                     key: 'customer',
                                                     label: 'Cliente'
                                                 }, {key: 'value', label: 'Valor'}, {
                                                     key: 'billingType',
                                                     label: 'Tipo'
                                                 }, {key: 'status', label: 'Status'}, {
                                                     key: 'dueDate',
                                                     label: 'Vencimento'
                                                 }, {key: 'description', label: 'Descrição'}]}/></main>
    </PermissionGate>
}
