import {PermissionGate} from '../permissions';
import {ModuleTabs} from '../ModuleTabs';
import type {DataTableColumn} from '../DataTable';
import type {ApiItem} from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const VALOR_CURSO_COLUMNS: DataTableColumn[] = [
    {key: 'data', label: 'Data', render: (item) => formatDate(asRecord(item).data)},
    {key: 'curriculo_descricao', label: 'Curso'},
    {
        key: 'valor',
        label: 'Valor Curso',
        render: (item) => {
            const record = asRecord(item);
            return record.valor_hora ? '' : String(record.valor ? ? '');
        },
    },
    {
        key: 'valor_hora',
        label: 'Por Hora',
        render: (item) => (asRecord(item).valor_hora ? 'Sim' : 'Não'),
    },
    {
        key: 'valor_hora_valor',
        label: 'Valor Hora',
        render: (item) => {
            const record = asRecord(item);
            return record.valor_hora ? String(record.valor ? ? '') : '';
        },
    },
    {key: 'dias_spc', label: 'Dias Atraso'},
    {key: 'dias_tolerancia_multa', label: 'Dia Tolerância'},
];

export default function ViewValorCursoListValorCursoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Valor Curso</h1>
                <ModuleTabs
                    tabs={[
                        {
                            key: 'formaPagamento',
                            label: 'Forma Pagamento',
                            path: '/api/view/valorCurso/listValorCurso',
                            columns: VALOR_CURSO_COLUMNS,
                            maxMainColumns: VALOR_CURSO_COLUMNS.length,
                        },
                        {key: 'descontos', label: 'Descontos', empty: 'Conteúdo de Descontos.'},
                        {key: 'taxas', label: 'Taxas', empty: 'Conteúdo de Taxas.'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
