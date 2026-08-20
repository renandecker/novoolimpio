import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function AsaasCobrancasListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Cobranças Asaas</h1><DataTable path="/api/asaas/cobrancas" module="asaas"
                                                 columns={[{key: 'id', label: 'Id'}, {
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
