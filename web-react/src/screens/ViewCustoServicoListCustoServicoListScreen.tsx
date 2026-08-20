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

const TIPOS = ['Por Contato', 'Por Minuto', 'Por Dia', 'Por Semana', 'Por Mês', 'Por Ano'];

const renderTipo = (key: string) => (item: ApiItem) => {
    const value = asRecord(item)[key];
    const index = Number(value);
    return Number.isInteger(index) && index >= 0 && index < TIPOS.length ? TIPOS[index] : String(value ? ? '');
};

const renderValor = (key: string) => (item: ApiItem) => `R$ ${Number(asRecord(item)[key] ? ? 0).toFixed(2)}`;

const COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'valor_email', label: 'Valor Email', render: renderValor('valor_email')},
    {key: 'tipo_email', label: 'Tipo Serviço Email', render: renderTipo('tipo_email')},
    {key: 'valor_ligacao', label: 'Valor Ligação', render: renderValor('valor_ligacao')},
    {key: 'tipo_ligacao', label: 'Tipo Serviço Ligação', render: renderTipo('tipo_ligacao')},
    {key: 'data_alteracao', label: 'Data', render: (item) => formatDate(asRecord(item).data_alteracao)},
];

export default function ViewCustoServicoListCustoServicoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Custo Servico</h1>
                <DataTable path="/api/view/custoServico/listCustoServico" columns={COLUMNS}
                           maxMainColumns={COLUMNS.length}/>
            </main>
        </PermissionGate>
    );
}
