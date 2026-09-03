import React from 'react';
import {ModuleList} from '../ModuleListScreen';

export default function ViewCampanhaNegociacaoListCampanhaNegociacaoListScreen() {
    return <ModuleList 
        path="/api/financeiro/campanha-negociacao" 
        title="Campanhas de Negociação"
    />;
}