import { useState } from 'react';
import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import { MasterDetail } from '../MasterDetail';
import {
  USUARIO_SOURCE,
  USUARIO_COLUMNS,
  USUARIO_SEARCH,
  PERFIL_SOURCE,
  PERFIL_COLUMNS,
  PERFIL_SEARCH,
  RESULTADO_COBRANCA_SOURCE,
  RESULTADO_COBRANCA_COLUMNS,
  RESULTADO_COBRANCA_SEARCH,
} from '../masterDetailSources';
import type { ApiItem } from '../types';

export default function ViewEtapasCobrancaFormEtapasCobrancaListScreen() {
  const [usuarios, setUsuarios] = useState<ApiItem[]>([]);
  const [perfils, setPerfils] = useState<ApiItem[]>([]);
  const [resultados, setResultados] = useState<ApiItem[]>([]);

  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Form Etapas Cobranca</h1>
        <div className="div_form">
          <div className="form-title">Etapas Cobrança</div>
          <div className="table_form">
            <MasterDetail
              label="Usuário"
              source={USUARIO_SOURCE}
              valueKey="id"
              searchKeys={USUARIO_SEARCH}
              columns={USUARIO_COLUMNS}
              items={usuarios}
              onChange={setUsuarios}
            />
            <MasterDetail
              label="Perfil"
              source={PERFIL_SOURCE}
              valueKey="id"
              searchKeys={PERFIL_SEARCH}
              columns={PERFIL_COLUMNS}
              items={perfils}
              onChange={setPerfils}
            />
            <MasterDetail
              label="Resultado Ligação"
              source={RESULTADO_COBRANCA_SOURCE}
              valueKey="id"
              searchKeys={RESULTADO_COBRANCA_SEARCH}
              columns={RESULTADO_COBRANCA_COLUMNS}
              items={resultados}
              onChange={setResultados}
            />
          </div>
        </div>
        <DataTable path="/api/view/etapasCobranca/formEtapasCobranca" />
      </main>
    </PermissionGate>
  );
}
