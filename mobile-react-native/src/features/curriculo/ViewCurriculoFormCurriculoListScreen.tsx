import React from 'react';
import {ModuleWizard} from '../../shared/components/ModuleWizard';
import {
    UNIDADE_SOURCE,
    UNIDADE_COLUMNS,
    UNIDADE_SEARCH,
    COMPONENTE_SOURCE,
    COMPONENTE_COLUMNS,
    COMPONENTE_SEARCH,
} from '../../masterDetailSources';

interface CurriculoFormRouteParams {
    id?: string | number;
    entityId?: string | number;
}

export default function ViewCurriculoFormCurriculoListScreen({
                                                                 route,
                                                             }: {
    route?: { params?: CurriculoFormRouteParams };
}) {
    const editId = route?.params?.id ?? route?.params?.entityId ?? null;

    return (
        <ModuleWizard
            editId={editId}
            onSave={(data) => {
                console.log('Currículo salvo:', data);
                alert('Currículo salvo com sucesso!');
            }}
            steps={[
                {
                    key: 'curriculo',
                    label: 'Curso',
                    fields: [
                        {label: 'Descrição', placeholder: 'Descrição do currículo'},
                        {label: 'Sucinto', placeholder: 'Nome sucinto'},
                        {label: 'Sigla', placeholder: 'Sigla do curso'},
                    ],
                },
                {
                    key: 'licenca',
                    label: 'Licença',
                    fields: [
                        {label: 'Número do Parecer', placeholder: 'Número do parecer'},
                        {label: 'Licença', placeholder: 'Licença'},
                        {label: 'Reconhecimento', placeholder: 'Reconhecimento'},
                        {label: 'Descrição Diploma', placeholder: 'Descrição para o diploma'},
                    ],
                },
                {
                    key: 'matrizCurricular',
                    label: 'Matriz Curricular',
                    masterDetail: {
                        label: 'Componente Curricular',
                        source: COMPONENTE_SOURCE,
                        valueKey: 'id',
                        searchKeys: COMPONENTE_SEARCH,
                        columns: COMPONENTE_COLUMNS,
                        loadPath: '/api/educacao/matriz-curricular',
                        loadParam: 'curriculoId',
                        linkKey: 'componenteCurricularId',
                    },
                    fields: [
                        {label: 'Carga Horária Total do Curso', placeholder: 'Calculado automaticamente', disabled: true},
                        {label: 'Tipo de Matriz Curricular', placeholder: 'Selecione o tipo de matriz'},
                        {label: 'Grupo do Componente Curricular', placeholder: 'Selecione o grupo'},
                        {label: 'Ordem', placeholder: 'Ordem na matriz'},
                        {label: 'Modalidade', placeholder: 'Selecione a modalidade'},
                    ],
                },
                {
                    key: 'requisitos',
                    label: 'Requisitos',
                    fields: [
                        {label: 'Componente Curricular', placeholder: 'Selecione o componente'},
                        {label: 'Componente Curricular Requisito', placeholder: 'Selecione o requisito'},
                    ],
                },
                {
                    key: 'unidade',
                    label: 'Unidade',
                    masterDetail: {
                        label: 'Unidade',
                        source: UNIDADE_SOURCE,
                        valueKey: 'id',
                        searchKeys: UNIDADE_SEARCH,
                        columns: UNIDADE_COLUMNS,
                        loadPath: '/api/educacao/curriculo-unidade',
                        loadParam: 'curriculoId',
                        linkKey: 'unidadeId',
                    },
                },
                {
                    key: 'material',
                    label: 'Material',
                    fields: [
                        {label: 'Produto / Material', placeholder: 'Nome do material'},
                        {label: 'Quantidade', placeholder: '1'},
                        {label: 'Valor Unitário', placeholder: '0.00'},
                    ],
                },
                {
                    key: 'documentos',
                    label: 'Documentos',
                    fields: [
                        {label: 'Tipo Modelo Contrato (0=WORD, 1=PDF, 2=IMPRESSÃO)', placeholder: '0'},
                        {label: 'Tipo Modelo Promissória (0=WORD, 1=PDF, 2=IMPRESSÃO)', placeholder: '0'},
                        {label: 'Tipo Modelo Certificado (0=WORD, 1=PDF, 2=IMPRESSÃO)', placeholder: '0'},
                        {label: 'Tipo Modelo Boletim (0=WORD, 1=PDF, 2=IMPRESSÃO)', placeholder: '0'},
                        {label: 'Template Contrato', placeholder: 'Texto do template'},
                        {label: 'Template Certificado', placeholder: 'Texto do template'},
                        {label: 'Template Boletim', placeholder: 'Texto do template'},
                        {label: 'Template Promissória', placeholder: 'Texto do template'},
                    ],
                    nextLabel: 'Salvar',
                },
            ]}
        />
    );
}
