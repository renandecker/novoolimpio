import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

const COLUMNS = [
    {key: 'unidade_descricao', label: 'Id_unidade'},
    {key: 'curriculo_descricao', label: 'Curso'},
    {key: 'tipo_matricula', label: 'Tipo Matrícula'},
    {key: 'qtd_aulas_tolerancia_matricula', label: 'Aulas Tolerância'},
    {key: 'data_inicio', label: 'Data Início Aula'},
    {key: 'data_fim', label: 'Data Fim Aula'},
];

export default function ViewCriterioListCriterioListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Critérios de Curso</h1>
            <DataTable
                path="/api/view/criterio/listCriterio"
                columns={COLUMNS}
                maxMainColumns={3}
                editNavigateTo="/view/criterio/formCriterio"
                createNavigateTo="/view/criterio/formCriterio"/>
        </main>
    </PermissionGate>;
}
