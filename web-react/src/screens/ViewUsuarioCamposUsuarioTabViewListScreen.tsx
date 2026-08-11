import { useState } from 'react';
import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import { MasterDetail } from '../MasterDetail';
import { Wizard } from '../Wizard';
import {
  TURNO_TRABALHO_SOURCE,
  TURNO_TRABALHO_COLUMNS,
  TURNO_TRABALHO_SEARCH,
  PERFIL_SOURCE,
  PERFIL_COLUMNS,
  PERFIL_SEARCH,
  AGENDA_SOURCE,
  AGENDA_COLUMNS,
  AGENDA_SEARCH,
} from '../masterDetailSources';
import type { ApiItem } from '../types';

export default function ViewUsuarioCamposUsuarioTabViewListScreen() {
  const [turnosTrabalho, setTurnosTrabalho] = useState<ApiItem[]>([]);
  const [perfils, setPerfils] = useState<ApiItem[]>([]);
  const [agendas, setAgendas] = useState<ApiItem[]>([]);

  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Campos Usuario Tab View</h1>
        <div className="div_form">
          <div className="form-title">Usuário</div>
          <div className="table_form">
            <Wizard
              steps={[
                { key: 'pessoal', label: 'Pessoal', content: <p className="master-detail-empty">Dados pessoais.</p> },
                { key: 'endereco', label: 'Endereço', content: <p className="master-detail-empty">Endereço do usuário.</p> },
                { key: 'documentos', label: 'Documentos', content: <p className="master-detail-empty">Documentos do usuário.</p> },
                {
                  key: 'trabalho',
                  label: 'Trabalho',
                  content: (
                    <MasterDetail
                      label="Turno Trabalho"
                      source={TURNO_TRABALHO_SOURCE}
                      valueKey="id"
                      searchKeys={TURNO_TRABALHO_SEARCH}
                      columns={TURNO_TRABALHO_COLUMNS}
                      items={turnosTrabalho}
                      onChange={setTurnosTrabalho}
                    />
                  ),
                },
                { key: 'acessos', label: 'Acessos', content: <p className="master-detail-empty">Acessos do usuário.</p> },
                {
                  key: 'unidade',
                  label: 'Unidade',
                  content: <p className="master-detail-empty">Unidades vinculadas ao usuário.</p>,
                },
                {
                  key: 'perfil',
                  label: 'Perfil',
                  content: (
                    <MasterDetail
                      label="Perfil"
                      source={PERFIL_SOURCE}
                      valueKey="id"
                      searchKeys={PERFIL_SEARCH}
                      columns={PERFIL_COLUMNS}
                      items={perfils}
                      onChange={setPerfils}
                    />
                  ),
                },
                {
                  key: 'agenda',
                  label: 'Agenda',
                  nextLabel: 'Salvar',
                  content: (
                    <MasterDetail
                      label="Agenda"
                      source={AGENDA_SOURCE}
                      valueKey="id"
                      searchKeys={AGENDA_SEARCH}
                      columns={AGENDA_COLUMNS}
                      items={agendas}
                      onChange={setAgendas}
                    />
                  ),
                },
              ]}
            />
          </div>
        </div>
        <DataTable path="/api/view/usuario/camposUsuarioTabView" />
      </main>
    </PermissionGate>
  );
}
