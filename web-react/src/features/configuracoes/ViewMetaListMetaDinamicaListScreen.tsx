import {PermissionGate} from '../../shared/services/permissions';
import {ModuleTabs} from '../../shared/components/ModuleTabs';
import type {DataTableColumn} from '../../shared/components/DataTable';
import type {ApiItem} from '../../features/auth/types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const COLUMNS: DataTableColumn[] = [
    {key: 'indicador_descricao', label: 'Indicador'},
    {key: 'unidade_descricao', label: 'Unidade'},
    {key: 'ano', label: 'Ano'},
    {key: 'mes', label: 'MÃªs'},
    {
        key: 'data_atualizacao',
        label: 'Data AtualizaÃ§Ã£o',
        render: (item) => formatDate(asRecord(item).data_atualizacao),
    },
];

export default function ViewMetaListMetaDinamicaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Meta Dinamica</h1>
                <ModuleTabs
                    tabs={[
                        {
                            key: 'meta',
                            label: 'Meta',
                            path: '/api/view/meta/listMetaDinamica',
                            columns: COLUMNS,
                            maxMainColumns: COLUMNS.length,
                        },
                        {key: 'item2', label: 'Item 2', empty: 'ConteÃºdo de Item 2.'},
                        {key: 'listagem', label: 'Listagem', empty: 'ConteÃºdo de Listagem.'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
