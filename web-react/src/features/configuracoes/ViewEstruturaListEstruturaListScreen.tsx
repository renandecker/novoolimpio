import {PermissionGate} from '../permissions';
import {DataTable, type DataTableColumn} from '../DataTable';
import type {ApiItem} from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID da Estrutura'},
    {key: 'nome', label: 'Nome'},
    {key: 'coordenada', label: 'Coordenada'},
    {key: 'zoom', label: 'Coordenada'},
    {key: 'data_atualizacao', label: 'Data Atualização', render: (item) => formatDate(asRecord(item).data_atualizacao)},
    {key: 'email_descricao', label: 'Configuração Email'},
];

export default function ViewEstruturaListEstruturaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Estrutura</h1>
                <DataTable path="/api/view/estrutura/listEstrutura" columns={COLUMNS} maxMainColumns={COLUMNS.length}/>
            </main>
        </PermissionGate>
    );
}
