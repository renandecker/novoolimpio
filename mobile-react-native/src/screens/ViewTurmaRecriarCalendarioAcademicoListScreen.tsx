import React from 'react';
import {ModuleWizard} from '../ModuleWizard';

export default function ViewTurmaRecriarCalendarioAcademicoListScreen() {
    return (
        <ModuleWizard
            steps={[
                {
                    key: 'turma',
                    label: 'Turma',
                    path: '/api/view/turma/recriarCalendarioAcademico',
                    empty: 'Selecione a turma do calendário acadêmico.'
                },
                {key: 'periodo', label: 'Período', empty: 'Informe o período letivo para recriação.'},
                {
                    key: 'confirmacao',
                    label: 'Confirmação',
                    empty: 'Revise e recrie o calendário acadêmico.',
                    nextLabel: 'Recriar'
                },
            ]}
        />
    );
}
