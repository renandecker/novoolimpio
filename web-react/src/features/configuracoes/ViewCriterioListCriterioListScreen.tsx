import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

const COLUMNS = [
    {key: 'unidade_descricao', label: 'Id_unidade'},
    {key: 'curriculo_descricao', label: 'Curso'},
    {key: 'tipo_matricula', label: 'Tipo MatrÃ­cula'},
    {key: 'qtd_aulas_tolerancia_matricula', label: 'Aulas TolerÃ¢ncia'},
    {key: 'data_inicio', label: 'Data InÃ­cio Aula'},
    {key: 'data_fim', label: 'Data Fim Aula'},
];

export default function ViewCriterioListCriterioListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>CritÃ©rios de Curso</h1>
            <DataTable
                path="/api/view/criterio/listCriterio"
                columns={COLUMNS}
                maxMainColumns={3}
                editNavigateTo="/view/criterio/formCriterio"
                createNavigateTo="/view/criterio/formCriterio"/>
        </main>
    </PermissionGate>;
}
