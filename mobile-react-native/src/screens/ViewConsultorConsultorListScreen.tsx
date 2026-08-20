import React from 'react';
import {Tabs} from '../Tabs';
import {ModuleList} from '../ModuleListScreen';
import {ModuleWizard} from '../ModuleWizard';

// consultor.xhtml (olimpio.zip) shows one form per menu option; "menu==2" embeds the same
// <p:wizard id="wizardmatricula"> from formMatricula.xhtml, and "menu==4" embeds the same
// <p:wizard id="wizardrematricula"> from formRematricula.xhtml. These must stay as wizards
// inside their tab, not flattened into plain data tables.
export default function ViewConsultorConsultorListScreen() {
    return (
        <Tabs
            tabs={[
                {key: 'consultor', label: 'Consultor', content: <ModuleList path="/api/comercial/consultor"/>},
                {
                    key: 'tabMatricula',
                    label: 'Matrícula',
                    content: (
                        <ModuleWizard
                            steps={[
                                {key: 'tabMatricula', label: 'Matrícula', path: '/api/educacao/matricula'},
                                {key: 'tabMaterial', label: 'Material', empty: 'Material escolar da matrícula.'},
                                {
                                    key: 'tabValores',
                                    label: 'Valores',
                                    path: '/api/educacao/valor-curso',
                                    nextLabel: 'Salvar'
                                },
                            ]}
                        />
                    ),
                },
                {
                    key: 'tabRematricula',
                    label: 'Rematrícula',
                    content: (
                        <ModuleWizard
                            steps={[
                                {key: 'tabContrato', label: 'Contrato', path: '/api/educacao/contrato'},
                                {key: 'tabMatricula', label: 'Matrícula/Rematrícula', path: '/api/educacao/matricula'},
                                {key: 'tabMaterial', label: 'Material', path: '/api/estoque/venda-produto'},
                                {
                                    key: 'tabValores',
                                    label: 'Valores',
                                    path: '/api/educacao/valor-curso',
                                    nextLabel: 'Salvar'
                                },
                            ]}
                        />
                    ),
                },
            ]}
        />
    );
}
