import React from 'react';
import {ModuleWizard} from '../ModuleWizard';

export default function ViewEstruturaFormEstruturaListScreen() {
    return (
        <ModuleWizard
            steps={[
                {key: 'sql', label: 'SQL', path: '/api/view/estrutura/formEstrutura'},
                {
                    key: 'campos',
                    label: 'Campos',
                    empty: 'Dimensões, tempo, medidas e georeferência da estrutura.',
                    nextLabel: 'Salvar'
                },
            ]}
        />
    );
}
