import React from 'react';
import {FormLayout, FormTabConfig} from '../FormLayout';

const tipoCursoTabs: FormTabConfig[] = [
    {
        key: 'definicao',
        label: 'Definição',
        fields: [
            {name: 'id', label: 'ID', readOnly: true},
            {name: 'descricao', label: 'Descrição', required: true},
        ],
    },
];

export default function ViewCursoFormCursoListScreen() {
    return (
        <FormLayout
            title="Curso"
            tabs={tipoCursoTabs}
            initialValues={}
            onSubmit={(values) => {
                console.log('Salvar curso:', values);
                alert('Formulário enviado (implementar API)');
            }}
            onCancel={() => console.log('Cancelar')}
            submitLabel="Salvar"
            cancelLabel="Voltar"
        />
    );
}