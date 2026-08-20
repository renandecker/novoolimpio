import React from 'react';
import {ModuleWizard} from '../ModuleWizard';
import {
    TURNO_TRABALHO_SOURCE,
    TURNO_TRABALHO_COLUMNS,
    TURNO_TRABALHO_SEARCH,
    PERFIL_SOURCE,
    PERFIL_COLUMNS,
    PERFIL_SEARCH,
    AGENDA_SOURCE,
    AGENDA_COLUMNS,
    AGENDA_SEARCH
} from '../masterDetailSources';

export default function ViewUsuarioCamposUsuarioTabViewListScreen() {
    return (
        <ModuleWizard
            steps={[
                {key: 'pessoal', label: 'Pessoal', empty: 'Dados pessoais.'},
                {key: 'endereco', label: 'Endereço', empty: 'Endereço do usuário.'},
                {key: 'documentos', label: 'Documentos', empty: 'Documentos do usuário.'},
                {
                    key: 'trabalho',
                    label: 'Trabalho',
                    masterDetail: {
                        label: 'Turno Trabalho',
                        source: TURNO_TRABALHO_SOURCE,
                        valueKey: 'id',
                        searchKeys: TURNO_TRABALHO_SEARCH,
                        columns: TURNO_TRABALHO_COLUMNS
                    },
                },
                {key: 'acessos', label: 'Acessos', empty: 'Acessos do usuário.'},
                {key: 'unidade', label: 'Unidade', empty: 'Unidades vinculadas ao usuário.'},
                {
                    key: 'perfil',
                    label: 'Perfil',
                    masterDetail: {
                        label: 'Perfil',
                        source: PERFIL_SOURCE,
                        valueKey: 'id',
                        searchKeys: PERFIL_SEARCH,
                        columns: PERFIL_COLUMNS
                    },
                },
                {
                    key: 'agenda',
                    label: 'Agenda',
                    nextLabel: 'Salvar',
                    masterDetail: {
                        label: 'Agenda',
                        source: AGENDA_SOURCE,
                        valueKey: 'id',
                        searchKeys: AGENDA_SEARCH,
                        columns: AGENDA_COLUMNS
                    },
                },
            ]}
        />
    );
}
