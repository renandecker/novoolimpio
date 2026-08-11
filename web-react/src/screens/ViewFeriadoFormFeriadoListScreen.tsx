import { useState } from 'react';
import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import { MasterDetail } from '../MasterDetail';
import {
  UNIDADE_SOURCE,
  UNIDADE_COLUMNS,
  UNIDADE_SEARCH,
  TIPO_CURSO_SOURCE,
  TIPO_CURSO_COLUMNS,
  TIPO_CURSO_SEARCH,
} from '../masterDetailSources';
import type { ApiItem } from '../types';

export default function ViewFeriadoFormFeriadoListScreen() {
  const [tipoCursos, setTipoCursos] = useState<ApiItem[]>([]);
  const [unidades, setUnidades] = useState<ApiItem[]>([]);

  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Form Feriado</h1>
        <div className="div_form">
          <div className="form-title">Feriado</div>
          <div className="table_form">
            <MasterDetail
              label="Tipo Cursos"
              source={TIPO_CURSO_SOURCE}
              valueKey="id"
              searchKeys={TIPO_CURSO_SEARCH}
              columns={TIPO_CURSO_COLUMNS}
              items={tipoCursos}
              onChange={setTipoCursos}
            />
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
        <DataTable path="/api/view/feriado/formFeriado" />
      </main>
    </PermissionGate>
  );
}
