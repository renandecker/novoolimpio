import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';
import type {ApiItem} from '../../features/auth/types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const COLUMNS: DataTableColumn[] = [
    {key: 'data', label: 'Data', render: (item) => formatDate(asRecord(item).data)},
    {key: 'usuario_descricao', label: 'UsuÃ¡rio'},
    {key: 'numero_linhas', label: 'NÂº Linhas'},
    {
        key: 'prospectos_deletados_pacote',
        label: 'Prospectos Deletados',
        render: (item) => {
            const value = asRecord(item).prospectos_deletados_pacote;
            return value === -1 ? 'carregando e atualizando' : String(value ?? '');
        },
    },
];

export default function ViewArquivoProconListArquivoProconListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Arquivo Procon</h1>
                <DataTable path="/api/view/arquivoProcon/listArquivoProcon" columns={COLUMNS}
                           maxMainColumns={COLUMNS.length}/>
            </main>
        </PermissionGate>
    );
}
