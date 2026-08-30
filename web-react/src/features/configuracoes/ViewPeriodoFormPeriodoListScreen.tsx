import {useState} from 'react';
import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';
import {MasterDetail} from '../../shared/components/MasterDetail';
import {
    UNIDADE_SOURCE,
    UNIDADE_COLUMNS,
    UNIDADE_SEARCH,
} from '../../shared/services/masterDetailSources';
import type {ApiItem} from '../../features/auth/types';

export default function ViewPeriodoFormPeriodoListScreen() {
    const [unidades, setUnidades] = useState<ApiItem[]>([]);

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Periodo</h1>
                <div className="div_form">
                    <div className="form-title">PerÃ­odo</div>
                    <div className="table_form">
                        <MasterDetail
                            label="Unidade"
                            source={UNIDADE_SOURCE}
                            valueKey="id"
                            searchKeys={UNIDADE_SEARCH}
                            columns={UNIDADE_COLUMNS}
                            items={unidades}
                            onChange={setUnidades}
                        />
                    </div>
                </div>
                <DataTable path="/api/view/periodo/formPeriodo"/>
            </main>
        </PermissionGate>
    );
}
