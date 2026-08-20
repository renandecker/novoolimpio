import React from 'react';
import {ModuleTabs} from '../ModuleTabs';

export default function ViewPerfilFormPerfilListScreen() {
    return (
        <ModuleTabs
            tabs={[
                {key: 'config', label: 'Configurações Gerais', empty: 'Dados do perfil e permissões por módulo.'},
                {key: 'favoritos', label: 'Favoritos', empty: 'Favoritos do perfil.'},
            ]}
        />
    );
}
