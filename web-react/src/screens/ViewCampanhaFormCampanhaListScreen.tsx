import { useState } from 'react';
import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import { MasterDetail } from '../MasterDetail';
import {
  UNIDADE_SOURCE,
  UNIDADE_COLUMNS,
  UNIDADE_SEARCH,
} from '../masterDetailSources';
import type { ApiItem } from '../types';

export default function ViewCampanhaFormCampanhaListScreen() {
  const [unidades, setUnidades] = useState<ApiItem[]>([]);

  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Form Campanha</h1>
        <div className="div_form">
          <div className="form-title">Campanha</div>
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
        <DataTable path="/api/view/campanha/formCampanha" />
      </main>
    </PermissionGate>
  );
}
