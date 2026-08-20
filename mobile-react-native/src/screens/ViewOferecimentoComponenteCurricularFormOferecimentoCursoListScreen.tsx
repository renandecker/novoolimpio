import React from 'react';
import {ModuleWizard} from '../ModuleWizard';

export default function ViewOferecimentoComponenteCurricularFormOferecimentoCursoListScreen() {
    return (
        <ModuleWizard
            steps={[
                {
                    key: 'oferecimento',
                    label: 'Curso',
                    path: '/api/view/oferecimentoComponenteCurricular/formOferecimentoCurso'
                },
                {key: 'diasAula', label: 'Dias Aula', empty: 'Dias de aula do oferecimento.'},
                {key: 'professor', label: 'Professor', empty: 'Professores do oferecimento.', nextLabel: 'Salvar'},
            ]}
        />
    );
}
