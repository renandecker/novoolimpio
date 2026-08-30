import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function AsaasParcelasListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Parcelas Asaas</h1><DataTable path="/api/asaas/parcelas" module="asaas"
                                                columns={[{key: 'id', label: 'ID da Parcela Asaas'}, {
                                                    key: 'asaasId',
                                                    label: 'Id Asaas'
                                                }, {key: 'status', label: 'Status'}, {
                                                    key: 'billingType',
                                                    label: 'Tipo'
                                                }, {key: 'value', label: 'Valor'}, {
                                                    key: 'paymentDate',
                                                    label: 'Data Pagamento'
                                                }, {key: 'urlPagamento', label: 'Link'}]}/></main>
    </PermissionGate>
}
