import React from 'react';
import { ModuleWizard } from '../ModuleWizard';
export default function ViewUsuarioCamposUsuarioTabViewListScreen() {
  return (
    <ModuleWizard
      steps={[
        { key: 'pessoal', label: 'Pessoal', empty: 'Dados pessoais.' },
        { key: 'endereco', label: 'Endereço', empty: 'Endereço do usuário.' },
        { key: 'documentos', label: 'Documentos', empty: 'Documentos do usuário.' },
        { key: 'trabalho', label: 'Trabalho', empty: 'Turnos de trabalho.' },
        { key: 'acessos', label: 'Acessos', empty: 'Acessos do usuário.' },
        { key: 'unidade', label: 'Unidade', empty: 'Unidades vinculadas ao usuário.' },
        { key: 'perfil', label: 'Perfil', empty: 'Perfis de acesso vinculados.' },
        { key: 'agenda', label: 'Agenda', empty: 'Agendas vinculadas ao usuário.', nextLabel: 'Salvar' },
      ]}
    />
  );
}
