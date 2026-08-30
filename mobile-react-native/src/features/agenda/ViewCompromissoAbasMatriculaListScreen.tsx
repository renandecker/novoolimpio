import React from 'react';
import {ModuleTabs} from '../ModuleTabs';

export default function ViewCompromissoAbasMatriculaListScreen() {
    return (
        <ModuleTabs
            tabs={[
                {key: 'contrato', label: 'Contrato', empty: 'Dados do contrato.'},
                {key: 'matricula', label: 'Matrícula', empty: 'Dados da matrícula.'},
                {key: 'grupo', label: 'Grupo', empty: 'Grupo do compromisso.'},
                {key: 'material', label: 'Material', empty: 'Material escolar.'},
            ]}
        />
    );
}
