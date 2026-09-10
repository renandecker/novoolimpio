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

const formatValor = (item: ApiItem) => {
    const value = asRecord(item).valor;
    if (value === null || value === undefined || value === '') return '';
    return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(Number(value));
};

const COLUMNS: DataTableColumn[] = [
    {key: 'nome', label: 'Nome'},
    {key: 'categoria_descricao', label: 'Categoria'},
    {key: 'valor', label: 'Valor', render: formatValor},
    {key: 'quantidade', label: 'Quantidade'},
    {key: 'ativo', label: 'Ativo', render: (item) => (asRecord(item).ativo ? 'Sim' : 'Não')},
    {key: 'dt_cadastrado', label: 'Data Cadastro', render: (item) => formatDate(asRecord(item).dt_cadastrado)},
];

export default function ViewProdutoListProdutoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Produto</h1>
                <DataTable path="/api/view/produto/listProduto" columns={COLUMNS} maxMainColumns={COLUMNS.length}/>
            </main>
        </PermissionGate>
    );
}
