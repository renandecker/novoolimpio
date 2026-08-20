import React from 'react';
import {ModuleWizard} from '../ModuleWizard';

export default function ViewCampanhaFormGerarPacotesListScreen() {
    return (
        <ModuleWizard
            steps={[
                {key: 'informacoes', label: 'Informações', path: '/api/view/campanha/formGerarPacotes'},
                {key: 'filtros', label: 'Filtros', empty: 'Filtros gerais de geração de pacotes.'},
                {key: 'acao', label: 'Ação', empty: 'Ações da campanha.'},
                {key: 'prospecto', label: 'Prospecto', empty: 'Filtros de prospecto.'},
                {key: 'campos', label: 'Campos', empty: 'Campos da campanha.'},
                {key: 'ligacao', label: 'Ligação', empty: 'Filtros de ligação.'},
                {key: 'academico', label: 'Acadêmico', empty: 'Filtros acadêmicos.'},
                {
                    key: 'operacional',
                    label: 'Operacional',
                    empty: 'Usuários e pacotes operacionais.',
                    nextLabel: 'Gerar'
                },
            ]}
        />
    );
}
