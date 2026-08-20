import React from 'react';
import {ModuleWizard} from '../ModuleWizard';

export default function ViewMatriculaFormRematriculaListScreen() {
    return (
        <ModuleWizard
            steps={[
                {key: 'tabContrato', label: 'Contrato', path: '/api/educacao/contrato'},
                {key: 'tabMatricula', label: 'Matrícula/Rematrícula', path: '/api/educacao/matricula'},
                {key: 'tabMaterial', label: 'Material', path: '/api/estoque/venda-produto'},
                {key: 'tabValores', label: 'Valores', path: '/api/educacao/valor-curso', nextLabel: 'Salvar'},
            ]}
        />
    );
}
