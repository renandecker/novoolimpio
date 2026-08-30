import React from 'react';
import {ModuleWizard} from '../ModuleWizard';
import {
    UNIDADE_SOURCE,
    UNIDADE_COLUMNS,
    UNIDADE_SEARCH,
    COMPONENTE_SOURCE,
    COMPONENTE_COLUMNS,
    COMPONENTE_SEARCH
} from '../masterDetailSources';

export default function ViewCurriculoFormCurriculoListScreen() {
    return (
        <ModuleWizard
            steps={[
                {key: 'curriculo', label: 'Curso', path: '/api/educacao/curriculo'},
                {key: 'licenca', label: 'Licença', empty: 'Informações de licença do curso.'},
                {
                    key: 'matrizCurricular',
                    label: 'Matriz Curricular',
                    masterDetail: {
                        label: 'Componente Curricular',
                        source: COMPONENTE_SOURCE,
                        valueKey: 'id',
                        searchKeys: COMPONENTE_SEARCH,
                        columns: COMPONENTE_COLUMNS
                    },
                },
                {key: 'requisitos', label: 'Requisitos', path: '/api/educacao/detail-requisito'},
                {
                    key: 'unidade',
                    label: 'Unidade',
                    masterDetail: {
                        label: 'Unidade',
                        source: UNIDADE_SOURCE,
                        valueKey: 'id',
                        searchKeys: UNIDADE_SEARCH,
                        columns: UNIDADE_COLUMNS
                    },
                },
                {key: 'material', label: 'Material', path: '/api/educacao/material-escolar-curso'},
                {
                    key: 'contrato',
                    label: 'Documentos',
                    empty: 'Contratos, promissórias, certificados e boletins.',
                    nextLabel: 'Salvar'
                },
            ]}
        />
    );
}
