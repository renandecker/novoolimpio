import React from 'react';
import {ModuleTabs} from '../ModuleTabs';

export default function ViewNapAbasinfoListScreen() {
    return (
        <ModuleTabs
            tabs={[
                {key: 'aluno', label: 'Aluno', empty: 'Dados do aluno.'},
                {key: 'responsavel', label: 'Responsável', empty: 'Dados do responsável.'},
                {key: 'matricula', label: 'Matrícula', empty: 'Dados da matrícula.'},
                {key: 'caderno', label: 'Caderno', empty: 'Caderno do NAP.'},
                {key: 'oc', label: 'Oferecimento', empty: 'Componente curricular e status.'},
                {key: 'nota', label: 'Nota', empty: 'Notas do aluno.'},
                {key: 'ligacao', label: 'Ligação', empty: 'Ligações realizadas.'},
                {key: 'email', label: 'E-mail', empty: 'E-mails enviados.'},
                {key: 'chamada', label: 'Chamada', empty: 'Chamada de presença.'},
            ]}
        />
    );
}
