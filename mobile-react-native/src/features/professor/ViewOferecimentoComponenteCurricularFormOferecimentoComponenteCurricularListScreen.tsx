import React from 'react';
import {ModuleWizard} from '../ModuleWizard';

export default function ViewOferecimentoComponenteCurricularFormOferecimentoComponenteCurricularListScreen() {
    return (
        <ModuleWizard
            steps={[
                {
                    key: 'oferecimento',
                    label: 'Componente Curricular',
                    path: '/api/view/oferecimentoComponenteCurricular/formOferecimentoComponenteCurricular'
                },
                {key: 'diasAula', label: 'Dias Aula', empty: 'Dias de aula do oferecimento.'},
                {key: 'professor', label: 'Professor', empty: 'Professores do oferecimento.', nextLabel: 'Salvar'},
            ]}
        />
    );
}
