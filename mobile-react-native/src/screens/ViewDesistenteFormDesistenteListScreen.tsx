import React from 'react';
import { ModuleList } from '../ModuleListScreen';

// formDesistente.xhtml (olimpio.zip) is a plain single-panel form (po:cabecalho + po:formButtons),
// it does not use p:wizard — so no wizard/steps should be added here.
export default function ViewDesistenteFormDesistenteListScreen() {
  return <ModuleList path="/api/view/desistente/formDesistente" title="Desistente" />;
}
