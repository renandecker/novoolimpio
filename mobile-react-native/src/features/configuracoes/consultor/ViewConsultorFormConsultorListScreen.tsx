import React from 'react';
import {ModuleList} from '../ModuleListScreen';

// formConsultor.xhtml (olimpio.zip) is a single panel form (usuário + agenda + turnos de
// trabalho, all master-detail attributes) — it does not use p:wizard, so no wizard/steps here.
export default function ViewConsultorFormConsultorListScreen() {
    return <ModuleList path="/api/view/consultor/formConsultor" title="Consultor"/>;
}
