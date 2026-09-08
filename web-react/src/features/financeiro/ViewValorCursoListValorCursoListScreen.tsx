import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';
import type {ApiItem} from '../../shared/types/index';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const formatValor = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '';
    return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(Number(value));
};

const formatCargaHoraria = (item: ApiItem): string => {
    const record = asRecord(item);
    const value = record.curriculo_carga_horaria ?? record.curriculoCargaHoraria ?? record.carga_horaria;
    if (value === null || value === undefined || value === '') return '';
    return `${String(value)} H/A`;
};

const VALOR_CURSO_COLUMNS: DataTableColumn[] = [
    {key: 'data', label: 'Data', render: (item) => formatDate(asRecord(item).data)},
    {key: 'curriculo_descricao', label: 'Curso'},
    {key: 'carga_horaria', label: 'Carga Horária', render: formatCargaHoraria},
    {
        key: 'valor',
        label: 'Valor Curso',
        render: (item) => {
            const record = asRecord(item);
            return record.valor_hora ? '' : formatValor(record.valor);
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
            return record.valor_hora ? formatValor(record.valor) : '';
        },
    },
    {key: 'dias_spc', label: 'Dias Atraso'},
    {key: 'dias_tolerancia_multa', label: 'Dia Tolerância'},
    {
        key: 'descontos',
        label: 'Descontos',
        render: (item) => {
            const r = asRecord(item);
            return String(r.descontos ?? r.desconto_descricao ?? r.desconto ?? '-');
        },
    },
    {
        key: 'formas_pagamento',
        label: 'Forma Pagamento',
        render: (item) => {
            const r = asRecord(item);
            return String(r.formas_pagamento ?? r.forma_pagamento ?? r.formasPagamento ?? '-');
        },
    },
    {
        key: 'taxas',
        label: 'Taxas',
        render: (item) => {
            const r = asRecord(item);
            return String(r.taxas ?? r.taxa_descricao ?? '-');
        },
    },
    {
        key: 'unidades',
        label: 'Unidades',
        render: (item) => {
            const r = asRecord(item);
            return String(r.unidades ?? r.unidade_descricao ?? '-');
        },
    },
];

export default function ViewValorCursoListValorCursoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Valor Curso</h1>
                <DataTable path="/api/view/valorCurso/listValorCurso" columns={VALOR_CURSO_COLUMNS}
                           maxMainColumns={VALOR_CURSO_COLUMNS.length}
                           createNavigateTo="/view/valorCurso/formValorCurso"
                           editNavigateTo="/view/valorCurso/formValorCurso"/>
            </main>
        </PermissionGate>
    );
}
