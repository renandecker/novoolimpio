import {PermissionGate} from '../../../shared/services/permissions';

import {DataTable, type DataTableColumn} from '../../../shared/components/DataTable';

import {useApi} from '../../../shared/services/api';

import {API_PATHS} from '../../../shared/services/apiPaths';



const DESISTENTE_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID do Desistente'},
    {key: 'dataCriacao', label: 'Data Desistente'},
    {key: 'pessoaAlunoId', label: 'Aluno ID'},
    {key: 'pessoaFuncionarioId', label: 'Funcionário ID'},
    {key: 'contratoId', label: 'Contrato ID'},
    {key: 'motivoId', label: 'Motivo ID'},
    {key: 'descricao', label: 'Observação'},
    {key: 'ativo', label: 'Status'},
];



interface DesistenteData {

    entity: {

        id?: number;

        matriculaId?: number;

        motivoId?: number;

        data?: string;

        observacao?: string;

        status?: string;

    };

}



export default function ViewDesistenteFormDesistenteListScreen() {

    const {get, post, put} = useApi(API_PATHS.basico.desistente);



    // Simple form without wizard - direct data table with inline editing

    return (

        <PermissionGate permission="READ">

            <main>

                <h1>Form Desistente</h1>

                <div className="div_form">

                    <div className="form-title">Desistente</div>

                    <div className="table_form">

                        <DataTable path="/api/educacao/desistente" columns={DESISTENTE_COLUMNS}/>

                    </div>

                </div>

            </main>

        </PermissionGate>

    );

}

