import React from 'react';
import {ModuleList} from '../ModuleListScreen';

export default function ViewMovimentacaoListMovimentacaoEstoqueListScreen() {
    return <ModuleList path="/api/view/movimentacao/listMovimentacaoEstoque" hideCreate={true} hideView={true} hideUpdate={true} hideDelete={true}/>;
}
