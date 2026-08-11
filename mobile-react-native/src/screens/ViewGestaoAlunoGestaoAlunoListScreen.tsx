import React from 'react';
import { ModuleWizard } from '../ModuleWizard';
export default function ViewGestaoAlunoGestaoAlunoListScreen() {
  return (
    <ModuleWizard
      steps={[
        { key: 'busca', label: 'Buscar Aluno', path: '/api/view/gestaoAluno/gestaoAluno', empty: 'Busque o aluno para gerenciamento.' },
        { key: 'situacao', label: 'Situação Financeira', empty: 'Situação financeira do aluno.' },
        { key: 'pessoais', label: 'Dados Pessoais', empty: 'Dados pessoais do aluno.' },
        { key: 'historicoNap', label: 'Histórico NAP', empty: 'Histórico de atendimentos no NAP.' },
        { key: 'historicoCobranca', label: 'Histórico Cobrança', empty: 'Histórico de cobranças do aluno.' },
        { key: 'notas', label: 'Notas', empty: 'Notas do aluno.' },
        { key: 'presencas', label: 'Presenças', empty: 'Presenças do aluno.' },
        { key: 'historicoAluno', label: 'Histórico aluno', empty: 'Histórico completo do aluno.', nextLabel: 'Finalizar' },
      ]}
    />
  );
}
