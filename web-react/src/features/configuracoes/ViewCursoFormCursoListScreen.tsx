import {PermissionGate} from '../permissions';
import {FormLayout, FormTabConfig} from '../FormLayout';

const tipoCursoTabs: FormTabConfig[] = [
    {
        key: 'definicao',
        label: 'Definicao',
        fields: [
            {name: 'id', label: 'ID', readOnly: true},
            {name: 'descricao', label: 'Descricao', required: true, span: 3},
        ],
    },
];

export default function ViewCursoFormCursoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <FormLayout
                    title="Curso"
                    tabs={tipoCursoTabs}
                    initialValues={{}}
                    onSubmit={(values) => {
                        console.log('Salvar curso:', values);
                        alert('Formulario enviado (implementar API)');
                    }}
                    onCancel={() => console.log('Cancelar')}
                    submitLabel="Salvar"
                    cancelLabel="Voltar"
                />
            </main>
        </PermissionGate>
    );
}