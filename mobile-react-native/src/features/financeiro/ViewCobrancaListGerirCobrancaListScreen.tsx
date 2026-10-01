import React from 'react';
import {ModuleList} from '../ModuleListScreen';

export default function ViewCobrancaListGerirCobrancaListScreen() {
    return <ModuleList path="/api/view/cobranca/listGerirCobranca" hideCreate={true} hideSearch={true} />;
}
