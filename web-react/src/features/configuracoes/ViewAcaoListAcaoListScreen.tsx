import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

const COLUMNS = [
    {key: 'id', label: 'Id', sortable: true},
    {key: 'descricao', label: 'DescriÃ§Ã£o', sortable: true},
    {key: 'tipoAcaoId', label: 'Tipo de AÃ§Ã£o', sortable: true},
    {key: 'responsavelId', label: 'Contratante', sortable: true},
    {key: 'dataInicial', label: 'Data Inicial', sortable: true},
    {key: 'dataFinal', label: 'Data Final', sortable: true},
    {key: 'dataFinalCaptacao', label: 'Data Final CaptaÃ§Ã£o', sortable: true},
    {key: 'dataColeta', label: 'Data Coleta', sortable: true},
];

export default function ViewAcaoListAcaoListScreen() {
    return <PermissionGate permission="READ">
        <main>
            <h1>AÃ§Ã£o</h1>
            <DataTable path="/api/comercial/acao" columns={COLUMNS} searchKeys={['descricao']} />
        </main>
    </PermissionGate>
}
