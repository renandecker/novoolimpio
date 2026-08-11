import { useState } from 'react';
import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import { MasterDetail } from '../MasterDetail';
import {
  TURNO_TRABALHO_SOURCE,
  TURNO_TRABALHO_COLUMNS,
  TURNO_TRABALHO_SEARCH,
} from '../masterDetailSources';
import type { ApiItem } from '../types';

export default function ViewTurnoFuncionarioFormTurnoFuncionarioListScreen() {
  const [turnosTrabalho, setTurnosTrabalho] = useState<ApiItem[]>([]);

  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Form Turno Funcionario</h1>
        <div className="div_form">
          <div className="form-title">Turno Funcionário</div>
          <div className="table_form">
            <MasterDetail
              label="Turno Trabalho"
              source={TURNO_TRABALHO_SOURCE}
              valueKey="id"
              searchKeys={TURNO_TRABALHO_SEARCH}
              columns={TURNO_TRABALHO_COLUMNS}
              items={turnosTrabalho}
              onChange={setTurnosTrabalho}
            />
          </div>
        </div>
        <DataTable path="/api/view/turnoFuncionario/formTurnoFuncionario" />
      </main>
    </PermissionGate>
  );
}
