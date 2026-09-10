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

const COLUMNS: DataTableColumn[] = [
    {key: 'nome', label: 'Nome'},
    {
        key: 'data_criacao',
        label: 'Data Criação',
        render: (item) => formatDate(asRecord(item).data_criacao),
    },
    {
        key: 'fl_ano',
        label: 'Ano',
        render: (item) => (asRecord(item).fl_ano ? 'Sim' : 'Não'),
    },
    {
        key: 'fl_mes',
        label: 'Mês',
        render: (item) => (asRecord(item).fl_mes ? 'Sim' : 'Não'),
    },
    {
        key: 'fl_semana',
        label: 'Semana',
        render: (item) => (asRecord(item).fl_semana ? 'Sim' : 'Não'),
    },
    {
        key: 'fl_dia',
        label: 'Dia',
        render: (item) => (asRecord(item).fl_dia ? 'Sim' : 'Não'),
    },
];

export default function ViewIndicadorListIndicadorListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Indicador</h1>
                <DataTable path="/api/view/indicador/listIndicador" columns={COLUMNS} maxMainColumns={COLUMNS.length}/>
            </main>
        </PermissionGate>
    );
}
