import React from 'react';
import {ModuleWizard} from '../ModuleWizard';

export default function ViewRelatoriosFormMapaListScreen() {
    return (
        <ModuleWizard
            steps={[
                {key: 'definicao', label: 'Definição', path: '/api/relatorios/mapa'},
                {key: 'permissao', label: 'Permissão', empty: 'Usuários, unidades e perfis com acesso ao mapa.'},
                {key: 'regras', label: 'Regras', empty: 'Regras de marcação do mapa.'},
                {key: 'filtros', label: 'Filtros', path: '/api/relatorios/filtros', nextLabel: 'Salvar'},
            ]}
        />
    );
}
