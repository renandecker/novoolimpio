import React from 'react';
import {ModuleWizard} from '../ModuleWizard';
import {DIA_AULA_SOURCE, DIA_AULA_COLUMNS, DIA_AULA_SEARCH} from '../../masterDetailSources';

interface FormRouteParams {
    id?: string | number;
    entityId?: string | number;
}

export default function ViewOferecimentoComponenteCurricularFormOferecimentoCursoListScreen({
    route,
}: {
    route?: {params?: FormRouteParams};
}) {
    const editId = route?.params?.id ?? route?.params?.entityId ?? null;

    return (
        <ModuleWizard
            editId={editId}
            steps={[
                {
                    key: 'oferecimento',
                    label: 'Curso',
                    path: '/api/view/oferecimentoComponenteCurricular/formOferecimentoCurso'
                },
                {
                    key: 'diasAula',
                    label: 'Dias Aula',
                    masterDetail: {
                        label: 'Dias Aula (edc_oferecimento_dias_aula)',
                        source: DIA_AULA_SOURCE,
                        valueKey: 'id',
                        searchKeys: DIA_AULA_SEARCH,
                        columns: DIA_AULA_COLUMNS,
                        loadPath: '/api/educacao/oferecimento-componente-curricular/buscar-dias-aula-por-grupo',
                        loadParam: 'grupoId',
                        linkKey: 'id',
                    },
                },
                {key: 'professor', label: 'Professor', empty: 'Professores do oferecimento.', nextLabel: 'Salvar'},
            ]}
        />
    );
}
