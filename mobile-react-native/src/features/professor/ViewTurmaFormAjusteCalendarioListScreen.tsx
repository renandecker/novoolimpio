import React from 'react';
import {ModuleWizard} from '../ModuleWizard';

export default function ViewTurmaFormAjusteCalendarioListScreen() {
    return (
        <ModuleWizard
            steps={[
                {
                    key: 'turma',
                    label: 'Turma',
                    path: '/api/view/turma/formAjusteCalendario',
                    empty: 'Selecione a turma que terá o calendário ajustado.'
                },
                {key: 'ajuste', label: 'Ajuste', empty: 'Informe os ajustes de dias e horários de aula.'},
                {
                    key: 'confirmacao',
                    label: 'Confirmação',
                    empty: 'Revise e aplique o ajuste de calendário.',
                    nextLabel: 'Aplicar'
                },
            ]}
        />
    );
}
