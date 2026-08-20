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

const FERIADO_COLUMNS: DataTableColumn[] = [
    {key: 'nome', label: 'Nome'},
    {key: 'descricao', label: 'Descrição'},
    {
        key: 'dt_feriado',
        label: 'Data',
        render: (item) => formatDate(asRecord(item).dt_feriado),
    },
    {
        key: 'fl_feriado_fixo',
        label: 'Fixo',
        render: (item) => (asRecord(item).fl_feriado_fixo ? 'Sim' : 'Não'),
    },
    {
        key: 'fl_tipo_curso',
        label: 'Todos Cursos',
        render: (item) => (asRecord(item).fl_tipo_curso ? 'Sim' : 'Não'),
    },
    {
        key: 'fl_nacional',
        label: 'Nacional',
        render: (item) => (asRecord(item).fl_nacional ? 'Sim' : 'Não'),
    },
];

export default function ViewFeriadoListFeriadoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Feriado</h1>
                <ModuleTabs
                    tabs={[
                        {
                            key: 'tabela',
                            label: 'Tabela',
                            path: '/api/view/feriado/listFeriado',
                            columns: FERIADO_COLUMNS,
                            maxMainColumns: FERIADO_COLUMNS.length,
                        },
                        {key: 'calendario', label: 'Calendário', empty: 'Conteúdo de Calendário.'},
                        {
                            key: 'ajusteFeriadoOferecimento',
                            label: 'Ajuste Feriado Oferecimento',
                            empty: 'Conteúdo de Ajuste Feriado Oferecimento.'
                        },
                        {key: 'feriadoAjuste', label: 'Feriado Ajuste', empty: 'Conteúdo de Feriado Ajuste.'},
                        {
                            key: 'feriadoNaoAjustar',
                            label: 'Feriado Não Ajustar',
                            empty: 'Conteúdo de Feriado Não Ajustar.'
                        },
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
