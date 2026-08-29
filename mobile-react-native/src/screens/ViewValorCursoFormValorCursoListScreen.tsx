import React from 'react';
import {ModuleTabs} from '../ModuleTabs';
import {UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH} from '../masterDetailSources';

export default function ViewValorCursoFormValorCursoListScreen() {
    return (
        <ModuleTabs
            tabs={[
                {key: 'valorCurso', label: 'Valor Curso', path: '/api/view/valorCurso/formValorCurso'},
                {
                    key: 'unidade',
                    label: 'Unidade',
                    masterDetail: {
                        label: 'Unidade',
                        source: UNIDADE_SOURCE,
                        valueKey: 'id',
                        searchKeys: UNIDADE_SEARCH,
                        columns: UNIDADE_COLUMNS
                    }
                },
                {key: 'formaPagamento', label: 'Forma Pagamento', empty: 'Conteúdo de Forma Pagamento.'},
                {key: 'descontos', label: 'Descontos', empty: 'Conteúdo de Descontos.'},
                {key: 'taxas', label: 'Taxas', empty: 'Conteúdo de Taxas.'},
            ]}
        />
    );
}
