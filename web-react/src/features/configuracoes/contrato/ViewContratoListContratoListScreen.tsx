import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../../shared/components/DataTable';
import type {ApiItem} from '../../../shared/types/types.ts';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const renderStatus = (item: ApiItem) => {
    const record = asRecord(item);
    let label: string;
    let className: string;
    if (record.desistente === true) {
        label = 'Desistente';
        className = 'statusFINALIZADA';
    } else if (record.data_cancelamento !== null && record.data_cancelamento !== undefined && record.data_cancelamento !== '') {
        label = `Cancelado ${formatDate(record.data_cancelamento)}`;
        className = 'statusCANCELADA';
    } else if (record.inscricao !== true) {
        label = 'Ativo sem inscrição';
        className = 'statusPENDENTE';
    } else {
        label = 'Ativo';
        className = 'statusLIBERADA';
    }
    return <span className={className}>{label}</span>;
};

const COLUMNS: DataTableColumn[] = [
    {key: 'pessoa', label: 'Aluno'},
    {key: 'curso', label: 'Curso'},
    {key: 'unidade', label: 'Id_unidade'},
    {key: 'unidadeResponsavel', label: 'Unidade Responsável'},
    {key: 'status', label: 'Status', render: renderStatus},
    {key: 'data', label: 'Data', render: (item) => formatDate(asRecord(item).data)},
];

export default function ViewContratoListContratoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Contrato</h1>
                <DataTable path="/api/educacao/contrato" columns={COLUMNS} maxMainColumns={COLUMNS.length}/>
            </main>
        </PermissionGate>
    );
}
