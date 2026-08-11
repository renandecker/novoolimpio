import React from 'react';
import { ModuleWizard } from '../ModuleWizard';
export default function ViewUsuarioFormUsuarioListScreen() {
  return (
    <ModuleWizard
      steps={[
        { key: 'pessoal', label: 'Pessoal', empty: 'Dados pessoais.' },
        { key: 'acesso', label: 'Acesso', empty: 'Login e senha de acesso.' },
        { key: 'perfis', label: 'Perfis', empty: 'Perfis de acesso vinculados.' },
        { key: 'agendas', label: 'Agendas', empty: 'Agendas vinculadas ao usuário.' },
        { key: 'turnos', label: 'Turnos', empty: 'Turnos de trabalho.', nextLabel: 'Salvar' },
      ]}
    />
  );
}
