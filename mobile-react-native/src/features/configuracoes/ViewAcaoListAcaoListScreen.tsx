import React from 'react';
import {ModuleList} from '../ModuleListScreen';

export default function ViewAcaoListAcaoListScreen() {
    return <ModuleList path="/api/comercial/acao" columns={[
        {key: 'id', label: 'Id'},
        {key: 'descricao', label: 'Descrição'},
        {key: 'tipoAcaoId', label: 'Tipo de Ação'},
        {key: 'responsavelId', label: 'Contratante'},
        {key: 'dataInicial', label: 'Data Inicial'},
        {key: 'dataFinal', label: 'Data Final'},
        {key: 'dataFinalCaptacao', label: 'Data Final Captação'},
        {key: 'dataColeta', label: 'Data Coleta'},
    ]} />;
}
