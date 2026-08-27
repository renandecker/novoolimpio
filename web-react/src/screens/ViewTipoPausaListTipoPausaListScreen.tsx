import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';

/**
 * Tela /view/tipoPausa/listTipoPausa
 * Replica po:crud do extracted_aceso/src/main/webapp/view/tipoPausa/listTipoPausa.xhtml
 * Colunas: Id (80px) | Descrição (60%) | Tempo pausa (segundos) (25%)
 * Filtros: id (incl. intervalo), descricao texto — ver TipoPausaController.getFilters()
 */
const COLUMNS: DataTableColumn[] = [
    { key: 'id', label: 'Id' },
    { key: 'descricao', label: 'Descrição' },
    {
        key: 'qtde_tempo',
        label: 'Tempo pausa (segundos)',
        // O campo no banco é qtde_tempo; a API central expõe como tempo.
        // Suporta ambos para compatibilidade ViewService (/api/view/...) e /api/central/...
        render: (item: any) => {
            const v = item.qtde_tempo ?? item.tempo ?? item.qtdeTempo ?? '';
            return v === null || v === undefined ? '' : String(v);
        },
    },
];

export default function ViewTipoPausaListTipoPausaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Tipo Pausa</h1>
                <DataTable
                    path="/api/view/tipoPausa/listTipoPausa"
                    columns={COLUMNS}
                    maxMainColumns={COLUMNS.length}
                    editNavigateTo="/view/tipoPausa/formTipoPausa"
                    createNavigateTo="/view/tipoPausa/formTipoPausa"
                />
            </main>
        </PermissionGate>
    );
}
