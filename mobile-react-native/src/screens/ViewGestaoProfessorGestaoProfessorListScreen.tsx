import React from 'react';
import {ModuleTabs} from '../ModuleTabs';

export default function ViewGestaoProfessorGestaoProfessorListScreen() {
    return (
        <ModuleTabs
            tabs={[
                {key: 'gestao', label: 'Gestão', path: '/api/view/gestaoProfessor/gestaoProfessor'},
                {
                    key: 'disponibilidade',
                    label: 'Disponibilidade do Professor',
                    path: '/api/view/disponibilidadeProfessor/listDisponibilidadeProfessor'
                },
            ]}
        />
    );
}
