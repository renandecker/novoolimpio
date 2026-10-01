import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';
import type {ApiItem} from '../../shared/types/index';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatValor = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '';
    return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(Number(value));
};

const COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'vezes', label: 'Vezes'},
    {key: 'desconto', label: 'Desconto', render: (item) => formatValor(asRecord(item).desconto)},
    {key: 'juros', label: 'Juros', render: (item) => formatValor(asRecord(item).juros)},
    {key: 'multa', label: 'Multa', render: (item) => formatValor(asRecord(item).multa)},
    {key: 'dias_spc', label: 'Dias Atraso'},
    {key: 'dias_tolerancia_multa', label: 'Dia Tolerância'},
];

export default function ViewValorProdutoListValorProdutoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Valor Produto</h1>
                <DataTable path="/api/view/valorProduto/listValorProduto" columns={COLUMNS}
                           maxMainColumns={COLUMNS.length}
                           createNavigateTo="/view/valorProduto/formValorProduto"
                           editNavigateTo="/view/valorProduto/formValorProduto"/>
            </main>
        </PermissionGate>
    );
}
