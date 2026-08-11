import { useState } from 'react';
import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import { MasterDetail } from '../MasterDetail';
import { Wizard } from '../Wizard';
import {
  PERFIL_SOURCE,
  PERFIL_COLUMNS,
  PERFIL_SEARCH,
  AGENDA_SOURCE,
  AGENDA_COLUMNS,
  AGENDA_SEARCH,
  TURNO_TRABALHO_SOURCE,
  TURNO_TRABALHO_COLUMNS,
  TURNO_TRABALHO_SEARCH,
} from '../masterDetailSources';
import type { ApiItem } from '../types';

export default function ViewUsuarioFormUsuarioListScreen() {
  const [perfis, setPerfis] = useState<ApiItem[]>([]);
  const [agendas, setAgendas] = useState<ApiItem[]>([]);
  const [turnos, setTurnos] = useState<ApiItem[]>([]);

  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Form Usuario</h1>
        <div className="div_form">
          <div className="form-title">Usuário</div>
          <div className="table_form">
            <Wizard
              steps={[
                {
                  key: 'pessoal',
                  label: 'Pessoal',
                  content: (
                    <div className="form-grid">
                      <label className="form-field">
                        <span className="form-label">Nome</span>
                        <input className="form-input" placeholder="Nome completo" />
                      </label>
                      <label className="form-field">
                        <span className="form-label">Login</span>
                        <input className="form-input" placeholder="Login de acesso" />
                      </label>
                      <label className="form-field">
                        <span className="form-label">E-mail</span>
                        <input className="form-input" placeholder="E-mail" />
                      </label>
                      <label className="form-field">
                        <span className="form-label">Ativo</span>
                        <input className="form-input" placeholder="Sim / Não" />
                      </label>
                    </div>
                  ),
                },
                {
                  key: 'acesso',
                  label: 'Acesso',
                  content: (
                    <div className="form-grid">
                      <label className="form-field">
                        <span className="form-label">Senha</span>
                        <input className="form-input" type="password" placeholder="Senha" />
                      </label>
                      <label className="form-field">
                        <span className="form-label">Confirmar senha</span>
                        <input className="form-input" type="password" placeholder="Confirmar senha" />
                      </label>
                    </div>
                  ),
                },
                {
                  key: 'perfis',
                  label: 'Perfis',
                  content: (
                    <MasterDetail
                      label="Perfil"
                      source={PERFIL_SOURCE}
                      valueKey="id"
                      searchKeys={PERFIL_SEARCH}
                      columns={PERFIL_COLUMNS}
                      items={perfis}
                      onChange={setPerfis}
                    />
                  ),
                },
                {
                  key: 'agendas',
                  label: 'Agendas',
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
                {
                  key: 'turnos',
                  label: 'Turnos',
                  nextLabel: 'Salvar',
                  content: (
                    <MasterDetail
                      label="Turno de Trabalho"
                      source={TURNO_TRABALHO_SOURCE}
                      valueKey="id"
                      searchKeys={TURNO_TRABALHO_SEARCH}
                      columns={TURNO_TRABALHO_COLUMNS}
                      items={turnos}
                      onChange={setTurnos}
                    />
                  ),
                },
              ]}
            />
          </div>
        </div>
        <DataTable path="/api/view/usuario/formUsuario" />
      </main>
    </PermissionGate>
  );
}
