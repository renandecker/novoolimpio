import {useState} from 'react';
import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';
import {MasterDetail} from '../MasterDetail';
import {
    ETAPAS_SOURCE,
    ETAPAS_COLUMNS,
    ETAPAS_SEARCH,
} from '../masterDetailSources';
import type {ApiItem} from '../types';

export default function ViewResultadoCobrancaFormResultadoCobrancaListScreen() {
    const [etapas, setEtapas] = useState<ApiItem[]>([]);

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Resultado Cobranca</h1>
                <div className="div_form">
                    <div className="form-title">Motivo da Ligação</div>
                    <div className="table_form">
                        <MasterDetail
                            label="Etapas"
                            source={ETAPAS_SOURCE}
                            valueKey="id"
                            searchKeys={ETAPAS_SEARCH}
                            columns={ETAPAS_COLUMNS}
                            items={etapas}
                            onChange={setEtapas}
                        />
                    </div>
                </div>
                <DataTable path="/api/view/resultadoCobranca/formResultadoCobranca"/>
            </main>
        </PermissionGate>
    );
}
