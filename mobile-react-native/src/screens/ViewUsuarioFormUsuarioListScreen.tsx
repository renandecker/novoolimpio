import React from 'react';
import { ModuleWizard } from '../ModuleWizard';
import { PERFIL_SOURCE, PERFIL_COLUMNS, PERFIL_SEARCH, AGENDA_SOURCE, AGENDA_COLUMNS, AGENDA_SEARCH, TURNO_TRABALHO_SOURCE, TURNO_TRABALHO_COLUMNS, TURNO_TRABALHO_SEARCH } from '../masterDetailSources';

export default function ViewUsuarioFormUsuarioListScreen() {
  return (
    <ModuleWizard
      steps={[
        {
          key: 'pessoal',
          label: 'Pessoal',
          fields: [
            { label: 'Nome', placeholder: 'Nome completo' },
            { label: 'Login', placeholder: 'Login de acesso' },
            { label: 'E-mail', placeholder: 'E-mail' },
            { label: 'Ativo', placeholder: 'Sim / Não' },
          ],
        },
        {
          key: 'acesso',
          label: 'Acesso',
          fields: [
            { label: 'Senha', placeholder: 'Senha', secure: true },
            { label: 'Confirmar senha', placeholder: 'Confirmar senha', secure: true },
          ],
        },
        {
          key: 'perfis',
          label: 'Perfis',
          masterDetail: { label: 'Perfil', source: PERFIL_SOURCE, valueKey: 'id', searchKeys: PERFIL_SEARCH, columns: PERFIL_COLUMNS },
        },
        {
          key: 'agendas',
          label: 'Agendas',
          masterDetail: { label: 'Agenda', source: AGENDA_SOURCE, valueKey: 'id', searchKeys: AGENDA_SEARCH, columns: AGENDA_COLUMNS },
        },
        {
          key: 'turnos',
          label: 'Turnos',
          nextLabel: 'Salvar',
          masterDetail: { label: 'Turno de Trabalho', source: TURNO_TRABALHO_SOURCE, valueKey: 'id', searchKeys: TURNO_TRABALHO_SEARCH, columns: TURNO_TRABALHO_COLUMNS },
        },
      ]}
    />
  );
}
