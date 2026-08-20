import React from 'react';
import {ModuleTabs} from '../ModuleTabs';

export default function ViewCompromissoFinalizarCompromissoListScreen() {
    return (
        <ModuleTabs
            tabs={[
                {key: 'tabCompromisso', label: 'Compromisso', path: '/api/basico/compromisso'},
                {key: 'tabContrato', label: 'Contrato', path: '/api/educacao/contrato'},
                {key: 'tabMatricula', label: 'Matrícula', path: '/api/educacao/matricula'},
                {key: 'tabMaterial', label: 'Material', path: '/api/estoque/venda-produto'},
                {key: 'tabValores', label: 'Valores', path: '/api/educacao/valor-curso'},
            ]}
        />
    );
}
