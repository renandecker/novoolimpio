import {PermissionGate} from '../../../shared/services/permissions';

import {DataTable, type DataTableColumn} from '../../../shared/components/DataTable';

import {useApi} from '../../../shared/services/api';

import {API_PATHS} from '../../../shared/services/apiPaths';



const DESISTENTE_COLUMNS: DataTableColumn[] = [

    {key: 'id', label: 'ID do Desistente'},

    {key: 'matriculaId', label: 'Matrícula'},

    {key: 'motivoId', label: 'Motivo'},

    {key: 'data', label: 'Data'},

    {key: 'observacao', label: 'Observação'},

    {key: 'status', label: 'Status'},

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

