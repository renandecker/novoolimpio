import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';
import {Tabs} from '../../shared/components/Tabs';

export default function ViewConfiguracaoFormConfiguracaoParcelaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Configuracao Parcela</h1>
                <div className="div_form">
                    <div className="form-title">ConfiguraÃ§Ã£o Parcela</div>
                    <div className="table_form">
                        <Tabs
                            tabs={[
                                {
                                    key: 'geral',
                                    label: 'Geral',
                                    content: <p className="master-detail-empty">Unidade do contrato.</p>
                                },
                                {
                                    key: 'parcelamento',
                                    label: 'Parcelamento',
                                    content: <p className="master-detail-empty">Regras de parcelamento.</p>
                                },
                                {
                                    key: 'reparcelamento',
                                    label: 'Reparcelamento',
                                    content: <p className="master-detail-empty">Regras de reparcelamento.</p>
                                },
                                {
                                    key: 'cancelamento',
                                    label: 'Cancelamento',
                                    content: <p className="master-detail-empty">Regras de cancelamento.</p>
                                },
                            ]}
                        />
                    </div>
                </div>
                <DataTable path="/api/view/configuracao/formConfiguracaoParcela"/>
            </main>
        </PermissionGate>
    );
}
